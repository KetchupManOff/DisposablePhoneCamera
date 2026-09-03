/**
 * Pipeline Hybride de post-traitement d'image.
 *
 * 5 étapes (refs/aboutTheCameras.md) :
 * 1. Balance des blancs (Kelvin)
 * 2. Courbe de ton sigmoïde + Black/White Points
 * 3. Saturation + Biais colorimétrique
 * 4. Grain procédural modulé par luminance
 * 5. Vignettage radial + Halation
 *
 * 2026-09-02 — Réécriture complète.
 */

import type { FilmProfile } from './filmProfiles';
import type { BorderPreset } from './borderPresets';

// ═══════════════════════════════════════════════════════════
// Utilitaires
// ═══════════════════════════════════════════════════════════

function clamp(v: number, min = 0, max = 255): number {
  return Math.max(min, Math.min(max, v));
}

function hash2D(x: number, y: number, seed: number): number {
  let h = seed + x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return (h & 0x7fffffff) / 0x7fffffff;
}

// ═══════════════════════════════════════════════════════════
// Étape 1 — Balance des blancs (température Kelvin)
// ═══════════════════════════════════════════════════════════

function applyKelvinShift(r: number, g: number, b: number, kelvinShift: number): [number, number, number] {
  if (kelvinShift === 0) return [r, g, b];
  const factor = kelvinShift / 6500;
  if (factor > 0) {
    return [clamp(r * (1 + factor * 0.25)), clamp(g * (1 + factor * 0.08)), clamp(b * (1 - factor * 0.30))];
  }
  const f = Math.abs(factor);
  return [clamp(r * (1 - f * 0.25)), clamp(g * (1 + f * 0.05)), clamp(b * (1 + f * 0.30))];
}

// ═══════════════════════════════════════════════════════════
// Étape 2 — Courbe de transfert de ton (Tone Mapping)
// ═══════════════════════════════════════════════════════════

function applyBlackWhitePoints(
  r: number, g: number, b: number,
  bp: [number, number, number], wp: [number, number, number],
): [number, number, number] {
  return [
    clamp(((r - bp[0]) / (wp[0] - bp[0])) * 255),
    clamp(((g - bp[1]) / (wp[1] - bp[1])) * 255),
    clamp(((b - bp[2]) / (wp[2] - bp[2])) * 255),
  ];
}

function applySigmoidCurve(r: number, g: number, b: number, cm: number): [number, number, number] {
  const sig = (x: number, c: number) => {
    const t = Math.max(-20, Math.min(20, (x - 0.5) * c * 8));
    return 1 / (1 + Math.exp(-t));
  };
  return [clamp(sig(r / 255, cm) * 255), clamp(sig(g / 255, cm) * 255), clamp(sig(b / 255, cm) * 255)];
}

// ═══════════════════════════════════════════════════════════
// Étape 3 — Altération des canaux de couleur
// ═══════════════════════════════════════════════════════════

function applySaturation(r: number, g: number, b: number, sm: number): [number, number, number] {
  if (sm === 1) return [r, g, b];
  if (sm === 0) { const g2 = 0.299 * r + 0.587 * g + 0.114 * b; return [g2, g2, g2]; }
  const g2 = 0.299 * r + 0.587 * g + 0.114 * b;
  return [clamp(g2 + (r - g2) * sm), clamp(g2 + (g - g2) * sm), clamp(g2 + (b - g2) * sm)];
}

function applyColorBias(r: number, g: number, b: number, bias: string): [number, number, number] {
  switch (bias) {
    case 'green-cyan':   return [clamp(r * 0.94),      clamp(g * 1.04 + 3),  clamp(b * 1.02 + 2)];
    case 'yellow-red':   return [clamp(r * 1.04 + 3),  clamp(g * 1.02 + 1),  clamp(b * 0.94)];
    case 'vintage-warm': return [clamp(r * 1.05 + 2),  clamp(g * 1.01),      clamp(b * 0.92 - 1)];
    case 'magenta-shift':return [clamp(r * 1.03 + 4),  clamp(g * 0.95),      clamp(b * 1.04 + 4)];
    case 'muted-reds':   return [clamp(r * 0.97 + 2),  clamp(g * 1.01),      clamp(b * 1.01)];
    case 'pastel-milky': return [clamp(r * 0.93 + 8),  clamp(g * 0.94 + 6),  clamp(b * 0.91 + 6)];
    case 'cold-punchy':  return [clamp(r * 0.96),      clamp(g * 1.00),      clamp(b * 1.06 + 3)];
    case 'none': default: return [r, g, b];
  }
}

// ═══════════════════════════════════════════════════════════
// Étape 4 — Grain procédural (hash-based, modulé luminance)
// ═══════════════════════════════════════════════════════════

function addProceduralGrain(data: Uint8ClampedArray, w: number, h: number, strength: number): void {
  if (strength <= 0) return;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const luma = (0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]) / 255;
      const lf = luma < 0.65 ? Math.sin(luma * Math.PI / 0.65) * (1 - luma * 0.3) : 0;
      const noise = (hash2D(x, y, 42) - 0.5) * strength * 90 * lf;
      data[idx] = clamp(data[idx] + noise);
      data[idx + 1] = clamp(data[idx + 1] + noise);
      data[idx + 2] = clamp(data[idx + 2] + noise);
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Étape 5 — Effets optiques
// ═══════════════════════════════════════════════════════════

function vignetteFactor(x: number, y: number, w: number, h: number, s: number): number {
  if (s <= 0) return 1;
  const cx = w / 2, cy = h / 2;
  return 1 - s * Math.pow(Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / Math.sqrt(cx * cx + cy * cy), 2.0);
}

function getVignetteStrength(type: string): number {
  switch (type) { case 'monochrome': return 0.45; case 'instant_color': return 0.20; default: return 0.35; }
}

function applyHalation(data: Uint8ClampedArray, w: number, h: number, type: string): void {
  if (type === 'monochrome') return;
  const t = 220, int2 = type === 'instant_color' ? 0.06 : 0.10;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const luma = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      if (luma > t) {
        const exc = (luma - t) / (255 - t);
        data[idx] = clamp(data[idx] + exc * int2 * 40);
        data[idx + 1] = clamp(data[idx + 1] + exc * int2 * 15);
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Pipeline principal — Nouveau (hybride 5 étapes)
// ═══════════════════════════════════════════════════════════

export function applyFilmProfile(imageData: ImageData, profile: FilmProfile): HTMLCanvasElement {
  const { width: w, height: h } = imageData;
  const data = new Uint8ClampedArray(imageData.data);
  const vs = getVignetteStrength(profile.type);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      let [r, g, b] = [data[idx], data[idx + 1], data[idx + 2]];
      [r, g, b] = applyKelvinShift(r, g, b, profile.temperature_shift_kelvin);
      [r, g, b] = applyBlackWhitePoints(r, g, b, profile.rgb_black_point, profile.rgb_white_point);
      [r, g, b] = applySigmoidCurve(r, g, b, profile.contrast_multiplier);
      [r, g, b] = applySaturation(r, g, b, profile.saturation_multiplier);
      [r, g, b] = applyColorBias(r, g, b, profile.color_bias);
      const vig = vignetteFactor(x, y, w, h, vs);
      data[idx] = clamp(r * vig); data[idx + 1] = clamp(g * vig); data[idx + 2] = clamp(b * vig);
    }
  }
  addProceduralGrain(data, w, h, profile.grain_intensity);
  applyHalation(data, w, h, profile.type);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d')!.putImageData(new ImageData(data, w, h), 0, 0);
  return canvas;
}

// ═══════════════════════════════════════════════════════════
// Fonctions de bordure (basées sur les presets)
// ═══════════════════════════════════════════════════════════

export function addBorder(dataUrl: string, preset: BorderPreset): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const iW = img.naturalWidth, iH = img.naturalHeight;
      const ms = Math.min(iW, iH), m = preset.margins_percent;
      const top = Math.round(ms * m.top / 100), bottom = Math.round(ms * m.bottom / 100);
      const left = Math.round(ms * m.left / 100), right = Math.round(ms * m.right / 100);
      const c = document.createElement('canvas');
      c.width = iW + left + right; c.height = iH + top + bottom;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#fafaf5'; ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, left, top, iW, iH);
      resolve(c.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => reject(new Error('Failed to load image for border'));
    img.src = dataUrl;
  });
}

export async function addBorderById(dataUrl: string, presetId: string | null): Promise<string> {
  if (!presetId || presetId === '__none__') return dataUrl;
  const { getBorderPreset } = await import('./borderPresets');
  const preset = getBorderPreset(presetId);
  return preset ? addBorder(dataUrl, preset) : dataUrl;
}

// ═══════════════════════════════════════════════════════════
// Compatibilité — Ancien applyProfile (déprécié)
// ═══════════════════════════════════════════════════════════

import type { ProfileDefinition } from './colorProfiles';

export function applyProfile(imageData: ImageData, profile: ProfileDefinition): HTMLCanvasElement {
  const { filter: f } = profile;
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width; canvas.height = imageData.height;
  const ctx = canvas.getContext('2d')!;
  const data = new Uint8ClampedArray(imageData.data);
  const w = imageData.width, h = imageData.height;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      let r = data[idx], g = data[idx + 1], b = data[idx + 2];
      let nr = r * f.brightness, ng = g * f.brightness, nb = b * f.brightness;
      nr = ((nr - 128) * f.contrast) + 128; ng = ((ng - 128) * f.contrast) + 128; nb = ((nb - 128) * f.contrast) + 128;
      r = clamp(nr); g = clamp(ng); b = clamp(nb);
      if (f.saturation !== 1) {
        const g2 = 0.299 * r + 0.587 * g + 0.114 * b;
        if (f.saturation === 0) { r = g2; g = g2; b = g2; }
        else { r = clamp(g2 + (r - g2) * f.saturation); g = clamp(g2 + (g - g2) * f.saturation); b = clamp(g2 + (b - g2) * f.saturation); }
      }
      if (f.warmth !== 0) {
        if (f.warmth > 0) { r = clamp(r + f.warmth * 30); g = clamp(g + f.warmth * 10); b = clamp(b - f.warmth * 30); }
        else { const w2 = Math.abs(f.warmth); r = clamp(r - w2 * 30); g = clamp(g + w2 * 5); b = clamp(b + w2 * 30); }
      }
      if (f.vignette > 0) {
        const cx2 = w / 2, cy2 = h / 2, md = Math.sqrt(cx2 * cx2 + cy2 * cy2);
        const d2 = Math.sqrt((x - cx2) ** 2 + (y - cy2) ** 2);
        const v2 = 1 - f.vignette * Math.pow(d2 / md, 2.5);
        r = clamp(r * v2); g = clamp(g * v2); b = clamp(b * v2);
      }
      data[idx] = r; data[idx + 1] = g; data[idx + 2] = b;
    }
  }
  if (f.grain > 0) {
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * f.grain * 60;
      data[i] = clamp(data[i] + noise); data[i + 1] = clamp(data[i + 1] + noise); data[i + 2] = clamp(data[i + 2] + noise);
    }
  }
  ctx.putImageData(new ImageData(data, w, h), 0, 0);
  return canvas;
}

/**
 * Capture une frame d'un élément <video> dans un canvas.
 * Si un ratio cible (largeur / hauteur) est fourni, l'image est
 * recadrée (center-crop) pour correspondre à ce ratio.
 */
export function captureFrame(
  video: HTMLVideoElement,
  targetRatio?: number,
  mirror = false,
): HTMLCanvasElement {
  const srcW = video.videoWidth;
  const srcH = video.videoHeight;

  // Ratio cible (largeur / hauteur). À défaut, on conserve le ratio natif.
  const ratio = targetRatio ?? srcW / srcH;

  // Dimensions de sortie (on garde la plus grande dimension native et on recadre)
  let outW = srcW;
  let outH = srcH;
  let sx = 0;
  let sy = 0;
  let sw = srcW;
  let sh = srcH;

  if (ratio > srcW / srcH) {
    // Le ratio cible est plus large → recadrer en hauteur
    outW = srcW;
    outH = Math.round(srcW / ratio);
    sy = Math.round((srcH - outH) / 2);
    sw = srcW;
    sh = outH;
  } else if (ratio < srcW / srcH) {
    // Le ratio cible est plus haut → recadrer en largeur
    outW = Math.round(srcH * ratio);
    outH = srcH;
    sx = Math.round((srcW - outW) / 2);
    sw = outW;
    sh = srcH;
  }

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d')!;

  // Miroir horizontal (uniquement pour la caméra avant / selfie)
  if (mirror) {
    ctx.translate(outW, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, outW, outH);
  return canvas;
}

/**
 * Adds a Polaroid-style white border to an image data URL.
 * The original photo stays intact — the border is rendered onto a new canvas.
 *
 * The paper is a physical rectangle that doesn't rotate:
 *   - Portrait images: wider border at the bottom (classic Polaroid look)
 *   - Landscape images: wider border on the right side (paper turned sideways)
 *
 * Proportions:
 *   - Thin borders: 8% of the shortest image side
 *   - Thick border: 20% of the shortest image side
 *   - White (#fafaf5) background with a very subtle warm tint
 */
export function addPolaroidBorder(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      const minSide = Math.min(imgW, imgH);

      const thinBorder = Math.round(minSide * 0.08);
      const thickBorder = Math.round(minSide * 0.20);

      const isPortrait = imgH > imgW;

      // Canvas dimensions: paper doesn't rotate, so the thick side
      // is at the bottom (portrait) or on the right (landscape).
      const canvasW = isPortrait
        ? imgW + thinBorder * 2            // thin left + thin right
        : imgW + thinBorder + thickBorder; // thin left + thick right
      const canvasH = isPortrait
        ? imgH + thinBorder + thickBorder  // thin top + thick bottom
        : imgH + thinBorder * 2;           // thin top + thin bottom

      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d')!;

      // White background (slightly warm, like real Polaroid paper)
      ctx.fillStyle = '#fafaf5';
      ctx.fillRect(0, 0, canvasW, canvasH);

      // Draw the image anchored at top-left with thin borders on top and left
      ctx.drawImage(img, thinBorder, thinBorder, imgW, imgH);

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => reject(new Error('Failed to load image for polaroid border'));
    img.src = dataUrl;
  });
}