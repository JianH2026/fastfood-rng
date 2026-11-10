// All sounds are synthesized with the Web Audio API -- no audio files needed.

let ctx: AudioContext | null = null;
let muted = false;

try {
  if (typeof window !== "undefined") muted = window.localStorage.getItem("muted") === "1";
} catch {
  /* storage blocked: stay unmuted */
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Call from a click handler so browsers allow audio later (autoplay policy). */
export function unlockAudio() {
  getCtx();
}

export function isMuted() {
  return muted;
}

const listeners = new Set<() => void>();
export function subscribeMuted(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function setMuted(m: boolean) {
  muted = m;
  listeners.forEach((cb) => cb());
  try {
    window.localStorage.setItem("muted", m ? "1" : "0");
  } catch {
    /* ignore */
  }
}

type ToneOpts = { type?: OscillatorType; vol?: number; slideTo?: number };

function tone(c: AudioContext, freq: number, start: number, dur: number, opts: ToneOpts = {}) {
  const { type = "sine", vol = 0.15, slideTo } = opts;
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** The click you hear each time a card passes the marker. */
export function playTick() {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  tone(c, 950 + Math.random() * 120, 0, 0.045, { type: "square", vol: 0.04 });
}

const C5 = 523.25, E5 = 659.25, G5 = 783.99, C6 = 1046.5, E6 = 1318.5, G6 = 1568;

export type RevealKind = "restaurant" | "Meh" | "Common" | "Rare" | "Epic" | "Legendary";

/** Sound when a reel lands. Higher rarity = bigger sound. */
export function playReveal(kind: RevealKind) {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  switch (kind) {
    case "restaurant":
      tone(c, 880, 0, 0.35, { vol: 0.12 });
      tone(c, 1320, 0.05, 0.3, { vol: 0.05 });
      break;
    case "Meh": // sad little womp
      tone(c, 220, 0, 0.35, { type: "sawtooth", vol: 0.08, slideTo: 110 });
      break;
    case "Common":
      tone(c, C5, 0, 0.3, { vol: 0.14 });
      break;
    case "Rare":
      tone(c, C5, 0, 0.25, { vol: 0.14 });
      tone(c, G5, 0.1, 0.4, { vol: 0.14 });
      break;
    case "Epic":
      [C5, E5, G5, C6].forEach((f, i) => tone(c, f, i * 0.09, 0.5, { type: "triangle", vol: 0.14 }));
      tone(c, G6, 0.36, 0.6, { vol: 0.06 });
      break;
    case "Legendary": {
      [C5, E5, G5, C6, E6, G6].forEach((f, i) => tone(c, f, i * 0.08, 0.4, { type: "triangle", vol: 0.14 }));
      // sustained fanfare chord + bass hit + sparkles
      [C6, E6, G6].forEach((f) => tone(c, f, 0.5, 1.2, { vol: 0.09 }));
      tone(c, 65.4, 0.5, 1.0, { type: "square", vol: 0.1 });
      [2093, 2637, 3136, 2349].forEach((f, i) => tone(c, f, 0.7 + i * 0.1, 0.25, { vol: 0.04 }));
      break;
    }
  }
}
