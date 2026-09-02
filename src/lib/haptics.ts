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

/** « Clic » final : le film est armé, on peut photographier. */
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

/** Débloque le contexte audio pour les haptiques flash (appelé au premier contact). */
export function primeFlashHaptics(): void {
  getAudioContext();
}

/** « Pop » — activation du flash (tige tirée vers le haut). */
export function flashToggleOn(): void {
  vibrate([20, 30, 50]);
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;

  // Son de claquement sec : « tchac » (tige qui sort).
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer(ctx, 0.03);
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.setValueAtTime(3500, t);
  band.Q.value = 2;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.35, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  noise.connect(band);
  band.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(t);
  noise.stop(t + 0.05);

  // Tonalité montante (tige qui s'élève).
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, t);
  osc.frequency.exponentialRampToValueAtTime(900, t + 0.06);
  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.12, t);
  oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.1);
}

/** « Clac » — désactivation du flash (tige repoussée). */
export function flashToggleOff(): void {
  vibrate([15, 20]);
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;

  // Son plus sourd : la tige rentre.
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer(ctx, 0.03);
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.setValueAtTime(2000, t);
  band.Q.value = 1.5;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.28, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  noise.connect(band);
  band.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(t);
  noise.stop(t + 0.05);

  // Tonalité descendante (tige qui rentre).
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(900, t);
  osc.frequency.exponentialRampToValueAtTime(500, t + 0.06);
  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.12, t);
  oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.1);
}
