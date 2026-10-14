type AudioContextConstructor = typeof AudioContext;

function resolveAudioContext(): AudioContextConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    webkitAudioContext?: AudioContextConstructor;
  };
  return window.AudioContext ?? w.webkitAudioContext ?? null;
}

/**
 * Tiny Web Audio blip for move / capture / check feedback.
 * No-ops on the server and when AudioContext is unavailable.
 */
export function playSound(freq: number): void {
  try {
    const Ctor = resolveAudioContext();
    if (!Ctor) return;

    const ctx = new Ctor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch {
    // Autoplay policies or missing Web Audio — ignore.
  }
}

export const SOUND = {
  move: 300,
  capture: 400,
  check: 500,
  mate: 600,
} as const;
