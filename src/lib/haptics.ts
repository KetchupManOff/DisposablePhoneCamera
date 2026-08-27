/**
 * Retour haptique + sonore de la molette d'armement (crinquage).
 *
 * - Vibration : API Vibration (Android). Absente sur iOS Safari → repli audio.
 * - Clic mécanique : WebAudio, généré à la volée. Fonctionne partout dès
 *   qu'un geste utilisateur a démarré le contexte audio (y compris iOS).
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      audioCtx = new Ctor();
    }
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/** À appeler dès le début du geste pour débloquer l'audio sur mobile (iOS). */
export function primeCrankHaptics(): void {
  getAudioContext();
}

function vibrate(pattern: number | number[]): void {
  try {
    const nav = navigator as Navigator & {
      vibrate?: (pattern: number | number[]) => boolean;
    };
    if (typeof nav.vibrate === 'function') {
      nav.vibrate(pattern);
    }
  } catch {
    /* ignore */
  }
}

function noiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/** « Clic » de chaque détente de la molette (cliquet). */
export function crankTick(): void {
  vibrate(12);
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;

  // Claquement aigu (détente métallique).
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer(ctx, 0.035);
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.setValueAtTime(2800, t);
  band.Q.value = 1.2;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.3, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  noise.connect(band);
  band.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(t);
  noise.stop(t + 0.05);

  // Léger « toc » grave.
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(190, t);
  osc.frequency.exponentialRampToValueAtTime(90, t + 0.045);
  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.18, t);
  oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.06);
}

/** « Clac » final : le film est armé, on peut photographier. */
export function crankComplete(): void {
  vibrate([40, 30, 80]);
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer(ctx, 0.07);
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.setValueAtTime(1400, t);
  band.Q.value = 1;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.45, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
  noise.connect(band);
  band.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(t);
  noise.stop(t + 0.1);

  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(130, t);
  osc.frequency.exponentialRampToValueAtTime(55, t + 0.1);
  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.26, t);
  oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.13);
}
