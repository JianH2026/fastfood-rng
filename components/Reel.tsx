"use client";

import { useEffect, useRef, useState } from "react";
import { playTick } from "@/lib/sound";

export type ReelCard = {
  id: string;
  label: string;
  sub?: string;
  image?: string; // photo; a plain letter tile shows if it fails to load
  color: string; // glow / border color (rarity color)
};

export const CARD_W = 150; // px, including spacing
const DURATION_MS = 5200;

// Photo with a plain letter tile if the file is missing.
export function FoodVisual({ card, size }: { card: ReelCard; size: number }) {
  const [failed, setFailed] = useState(false);
  if (card.image && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={card.image}
        alt={card.label}
        width={size}
        height={size}
        className="rounded-xl object-cover"
        style={{ width: size, height: size }}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-xl bg-base-300 font-display text-neutral/50"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
      aria-hidden
    >
      {card.label.charAt(0)}
    </div>
  );
}

export function CardFace({ card, size = 110, className = "" }: { card: ReelCard; size?: number; className?: string }) {
  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-2xl border-2 bg-base-100 p-2 text-center ${className}`}
      style={{ borderColor: card.color, boxShadow: `0 0 18px ${card.color}55, inset 0 -4px 0 ${card.color}` }}
    >
      <FoodVisual card={card} size={size} />
      <div className="line-clamp-2 text-sm font-bold leading-tight">{card.label}</div>
      {card.sub && <div className="text-xs opacity-60">{card.sub}</div>}
    </div>
  );
}

/**
 * A CS:GO-style case-opening strip. `cards[winnerIndex]` is where it lands.
 * Remount it (change `key`) to spin again.
 */
export function Reel({
  cards,
  winnerIndex,
  onDone,
}: {
  cards: ReelCard[];
  winnerIndex: number;
  onDone: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  });
  const [offset, setOffset] = useState(0);
  const [go, setGo] = useState(false);
  // Land somewhere random inside the winning card, like the real thing.
  const [jitter] = useState(() => (Math.random() - 0.5) * CARD_W * 0.6);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const t = setTimeout(() => doneRef.current(), 300);
      return () => clearTimeout(t);
    }
    const wrapW = wrapRef.current?.clientWidth ?? 600;
    const target = winnerIndex * CARD_W + CARD_W / 2 - wrapW / 2 + jitter;
    // Two frames so the browser paints the start position before we animate.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setGo(true);
        setOffset(target);
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [winnerIndex, jitter]);

  // Tick each time a new card crosses the center marker, read from the live animated position.
  useEffect(() => {
    let raf = 0;
    let last = -1;
    const loop = () => {
      const el = trackRef.current;
      const wrap = wrapRef.current;
      if (el && wrap) {
        const x = -new DOMMatrixReadOnly(getComputedStyle(el).transform).m41;
        const idx = Math.floor((x + wrap.clientWidth / 2) / CARD_W);
        if (last !== -1 && idx !== last) playTick();
        last = idx;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full overflow-hidden rounded-2xl border-4 border-neutral bg-base-300 py-4">
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-base-300 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-base-300 to-transparent" />
      {/* center marker */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-1 -translate-x-1/2 bg-warning shadow-[0_0_12px_2px_#f59e0b]" />
      <div className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 text-warning">▼</div>
      <div className="pointer-events-none absolute bottom-0 left-1/2 z-20 -translate-x-1/2 text-warning">▲</div>

      <div
        ref={trackRef}
        className="flex"
        style={{
          transform: `translateX(${-offset}px)`,
          transition: go ? `transform ${DURATION_MS}ms cubic-bezier(0.08, 0.7, 0.12, 1)` : "none",
          willChange: "transform",
        }}
        onTransitionEnd={() => doneRef.current()}
      >
        {cards.map((c, i) => (
          <div key={`${c.id}-${i}`} className="shrink-0 px-2" style={{ width: CARD_W }}>
            <CardFace card={c} size={CARD_W - 40} />
          </div>
        ))}
      </div>
    </div>
  );
}
