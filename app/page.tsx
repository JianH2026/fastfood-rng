"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { imagePath, restaurantImagePath, restaurants, type Item, type Restaurant } from "@/lib/data";
import { SLOT_COUNT, randomFrom, rarityOf, scoreLineup, type Pick } from "@/lib/game";
import { CardFace, FoodVisual, Reel, type ReelCard } from "@/components/Reel";
import { isMuted, playReveal, setMuted, subscribeMuted, unlockAudio, type RevealKind } from "@/lib/sound";

type Stage = "pickRestaurant" | "pickItem";
type Phase = Stage | "done";

const AUTO_ROLL_DELAY_MS = 1100; // pause on the restaurant before the menu auto-rolls

const STRIP_LENGTH = 45;
const WINNER_INDEX = 36;

const restaurantCard = (r: Restaurant): ReelCard => ({
  id: r.name,
  label: r.name,
  image: restaurantImagePath(r.name),
  color: "#f97316",
});

const itemCard = (r: Restaurant, i: Item): ReelCard => ({
  id: `${r.name}-${i.name}`,
  label: i.name,
  sub: `${rarityOf(i.rating).label} · ${i.rating}/10`,
  image: imagePath(r.name, i.name),
  color: rarityOf(i.rating).color,
});

// Build a long strip of random cards with the real winner placed near the end.
function buildStrip<T>(pool: T[], winner: T, toCard: (t: T) => ReelCard): ReelCard[] {
  return Array.from({ length: STRIP_LENGTH }, (_, idx) =>
    toCard(idx === WINNER_INDEX ? winner : randomFrom(pool))
  );
}

type Spin = { id: number; cards: ReelCard[]; onDone: () => void };

export default function Home() {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [stage, setStage] = useState<Stage>("pickRestaurant");
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [lastItem, setLastItem] = useState<{ restaurant: Restaurant; item: Item } | null>(null);
  const [spin, setSpin] = useState<Spin | null>(null);

  const [started, setStarted] = useState(false);
  const muted = useSyncExternalStore(subscribeMuted, isMuted, () => false);

  function toggleMute() {
    unlockAudio();
    setMuted(!muted);
  }

  const phase: Phase = picks.length >= SLOT_COUNT ? "done" : stage;
  const spinning = spin !== null;

  function launchSpin<T>(pool: T[], toCard: (t: T) => ReelCard, apply: (winner: T) => void) {
    const winner = randomFrom(pool);
    setSpin({
      id: Date.now(),
      cards: buildStrip(pool, winner, toCard),
      onDone: () => {
        setSpin(null);
        apply(winner);
      },
    });
  }

  // The player rolls the restaurant by hand.
  function rollRestaurant() {
    if (spinning) return;
    unlockAudio(); // browsers only allow sound after a click
    setLastItem(null);
    launchSpin(restaurants, restaurantCard, (r) => {
      playReveal("restaurant");
      setRestaurant(r);
      setStage("pickItem");
    });
  }

  // Once a restaurant lands, the menu item rolls automatically after a short pause.
  useEffect(() => {
    if (stage !== "pickItem" || !restaurant || spin) return;
    const r = restaurant;
    const t = setTimeout(() => {
      launchSpin(r.items, (i) => itemCard(r, i), (i) => {
        playReveal(rarityOf(i.rating).label as RevealKind);
        setLastItem({ restaurant: r, item: i });
        setPicks((prev) => [...prev, { restaurant: r, item: i }]);
        setStage("pickRestaurant");
      });
    }, AUTO_ROLL_DELAY_MS);
    return () => clearTimeout(t);
  }, [stage, restaurant, spin]);

  function startGame() {
    unlockAudio(); // browsers only allow sound after a click
    setStarted(true);
  }

  function reset() {
    setPicks([]);
    setStage("pickRestaurant");
    setRestaurant(null);
    setLastItem(null);
  }

  const score = phase === "done" ? scoreLineup(picks) : null;
  const lastCard = lastItem ? itemCard(lastItem.restaurant, lastItem.item) : null;

  const tickerEmojis = "🍔 🍟 🍗 🌮 🥤 🍩 🌭 🍕 🥓 🍦 🧀 🥪 ";
  const orderNo = 1000 + ((picks.length * 137 + (picks[0]?.item.rating ?? 0) * 61) % 9000);
  const inGame = started && phase !== "done";

  const pressable =
    "border-4 border-neutral font-display text-xl shadow-[4px_4px_0_var(--color-neutral)] transition-transform hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none";

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="overflow-hidden border-b-4 border-neutral bg-secondary py-1 text-2xl" aria-hidden>
        <div className="marquee-track">
          <span className="whitespace-pre">{tickerEmojis.repeat(10)}</span>
          <span className="whitespace-pre">{tickerEmojis.repeat(10)}</span>
        </div>
      </div>

      <button
        className="btn btn-circle btn-secondary fixed right-3 top-14 z-30 border-4 border-neutral"
        onClick={toggleMute}
        aria-label={muted ? "Unmute sound" : "Mute sound"}
        title={muted ? "Unmute" : "Mute"}
      >
        {muted ? "🔇" : "🔊"}
      </button>

      {/* ---------- 1. Intro: title + Start ---------- */}
      {!started && (
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-4 py-10 text-center">
          <div className="inline-block rounded-full border-4 border-neutral bg-base-100 px-4 py-1 text-sm font-extrabold uppercase tracking-widest">
            ★ Now serving ★
          </div>
          <h1 className="diner-title text-5xl leading-none sm:text-7xl">
            Ultimate
            <br />
            Fast Food Lineup
          </h1>
          <p className="max-w-md font-semibold opacity-80">
            Crack open a restaurant case and your menu item rolls automatically. Fill all {SLOT_COUNT} slots to get your score.
          </p>
          <button className={`btn btn-primary btn-lg px-10 ${pressable}`} onClick={startGame}>
            🍔 Start Order
          </button>
          <Link href="/credits" className="link text-sm opacity-70">
            Photo credits
          </Link>
        </main>
      )}

      {/* ---------- 2. Game: the roller fills the screen ---------- */}
      {inGame && (
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 py-4">
          <div className="flex items-center gap-3 pr-14">
            <span className="font-display text-lg">ORDER</span>
            <progress
              className="progress progress-primary h-4 flex-1 border-4 border-neutral bg-base-100"
              value={picks.length}
              max={SLOT_COUNT}
              aria-label="Lineup progress"
            />
            <span className="font-display text-lg">
              {picks.length}/{SLOT_COUNT}
            </span>
          </div>

          <section className="diner-card flex flex-1 flex-col items-center justify-center gap-5 p-5 text-center sm:p-7">
            <div className="rounded-full border-4 border-neutral bg-secondary px-4 py-1 font-display text-lg">
              Slot {picks.length + 1} · {phase === "pickRestaurant" ? "Pick a restaurant" : "Rolling your menu item…"}
            </div>

            {spin ? (
              <Reel key={spin.id} cards={spin.cards} winnerIndex={WINNER_INDEX} onDone={spin.onDone} />
            ) : (
              <div className="flex min-h-56 w-full items-center justify-center rounded-2xl border-4 border-dashed border-neutral/40 bg-base-200 p-4">
                {phase === "pickItem" && restaurant ? (
                  <div className="animate-pop">
                    <CardFace card={restaurantCard(restaurant)} size={120} />
                  </div>
                ) : lastCard ? (
                  <div className="animate-pop flex flex-col items-center gap-2">
                    <div className="font-display text-lg uppercase tracking-widest opacity-70">Order up!</div>
                    <CardFace card={lastCard} size={140} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-70">
                    <div className="text-6xl">🍽️</div>
                    <div className="font-display text-xl">Your table is ready</div>
                  </div>
                )}
              </div>
            )}

            <div>
              {phase === "pickRestaurant" ? (
                <button className={`btn btn-primary btn-lg ${pressable}`} onClick={rollRestaurant} disabled={spinning}>
                  {spinning ? <span className="loading loading-spinner" /> : "🍔 Open Restaurant Case"}
                </button>
              ) : (
                <div className="flex items-center gap-2 font-display text-xl opacity-80">
                  <span className="loading loading-dots" />
                  {spinning ? `Opening the ${restaurant?.name} menu…` : `Landed on ${restaurant?.name}!`}
                </div>
              )}
            </div>
          </section>

          {/* compact view of what you've picked so far */}
          <ul className="grid grid-cols-5 gap-2" aria-label="Your picks so far">
            {Array.from({ length: SLOT_COUNT }).map((_, i) => {
              const p = picks[i];
              if (!p) {
                return (
                  <li
                    key={i}
                    className="flex h-20 items-center justify-center rounded-xl border-4 border-dashed border-neutral/30 font-display text-xl opacity-50"
                  >
                    {i + 1}
                  </li>
                );
              }
              const card = itemCard(p.restaurant, p.item);
              return (
                <li
                  key={i}
                  className="animate-pop flex h-20 items-center gap-2 overflow-hidden rounded-xl border-4 bg-base-100 p-1"
                  style={{ borderColor: card.color }}
                  title={`${p.item.name} · ${p.restaurant.name}`}
                >
                  <div className="hidden shrink-0 sm:block">
                    <FoodVisual card={card} size={48} />
                  </div>
                  <div className="min-w-0 text-left text-xs leading-tight">
                    <div className="line-clamp-2 font-bold">{p.item.name}</div>
                    <div className="opacity-70">{p.item.rating}/10</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </main>
      )}

      {/* ---------- 3. Results: receipt + score ---------- */}
      {started && phase === "done" && score && (
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8">
          <section className="receipt-wrap mx-auto w-full max-w-md">
            <div className="receipt text-neutral">
              <div className="text-center">
                <div className="font-display text-3xl tracking-wide">🍔 THE LINEUP 🍟</div>
                <div className="text-xs uppercase tracking-[0.3em] opacity-70">Order #{orderNo} · Dine in</div>
              </div>
              <div className="my-3 border-b-2 border-dashed border-neutral/40" />

              <ul className="flex flex-col gap-3">
                {picks.map((p, i) => {
                  const r = rarityOf(p.item.rating);
                  return (
                    <li key={i} className="animate-slide-up">
                      <div className="receipt-line font-bold">
                        <span>
                          {i + 1}. {p.item.name}
                        </span>
                        <span className="dots" />
                        <span>{p.item.rating}/10</span>
                      </div>
                      <div className="flex items-center justify-between pl-5 text-xs opacity-75">
                        <span>
                          {p.restaurant.name} · {p.item.category}
                        </span>
                        <span className={`badge badge-sm ${r.badge}`}>{r.label}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="my-3 border-b-2 border-dashed border-neutral/40" />
              <div className="receipt-line text-lg font-bold">
                <span>TOTAL</span>
                <span className="dots" />
                <span>{score.total}/100</span>
              </div>
              <div className="mt-2 text-center text-xs uppercase tracking-widest opacity-60">★ Thank you, come again! ★</div>
            </div>
          </section>

          <section className="diner-card animate-pop">
            <div className="flex flex-col items-center gap-2 p-6 text-center">
              <div className="font-display text-lg uppercase tracking-widest opacity-70">Final score</div>
              <div className="shine-text font-display text-8xl">{score.total}</div>
              <div className="font-display text-3xl">
                Grade {score.grade} · {score.title}
              </div>

              <div className="stats stats-vertical mt-4 w-full border-4 border-neutral sm:stats-horizontal">
                <div className="stat">
                  <div className="stat-title">Item ratings</div>
                  <div className="stat-value font-display text-primary">{score.base}</div>
                  <div className="stat-desc">out of 70</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Variety bonus</div>
                  <div className="stat-value font-display text-accent">+{score.variety}</div>
                  <div className="stat-desc">different categories</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Brand combo</div>
                  <div className="stat-value font-display text-warning">+{score.brandCombo}</div>
                  <div className="stat-desc">same restaurant picks</div>
                </div>
              </div>

              <button className={`btn btn-primary btn-lg mt-4 ${pressable}`} onClick={reset}>
                🔄 New Order
              </button>
            </div>
          </section>

          {score.total >= 80 && <Confetti />}

          <footer className="pb-4 text-center text-sm opacity-70">
            Food photos from Wikimedia Commons ·{" "}
            <Link href="/credits" className="link font-bold">
              Photo credits
            </Link>
          </footer>
        </main>
      )}
    </div>
  );
}

function Confetti() {
  const emojis = ["🍔", "🍟", "🍗", "🌮", "🥤", "🍩", "🎉"];
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    emoji: emojis[i % emojis.length],
    left: `${(i * 37) % 100}%`,
    dur: `${3 + (i % 5) * 0.6}s`,
    delay: `${(i % 8) * 0.15}s`,
  }));
  return (
    <>
      {pieces.map((p, i) => (
        <span key={i} className="confetti-piece" style={{ left: p.left, animationDelay: p.delay, ["--dur" as string]: p.dur }} aria-hidden>
          {p.emoji}
        </span>
      ))}
    </>
  );
}
