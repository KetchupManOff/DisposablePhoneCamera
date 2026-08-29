import type { ProfileDefinition } from './colorProfiles';

/**
 * Applique les filtres de profil couleur sur une image via Canvas 2D.
 * Processus :
 * 1. Dessine l'image source dans un canvas
 * 2. Lit les pixels (getImageData)
 * 3. Applique brightness, contrast, saturation, warmth
 * 4. Ajoute du vignettage
 * 5. Ajoute du grain
 * 6. Renvoie le canvas modifié
 */

function clamp(v: number, min = 0, max = 255): number {
  return Math.max(min, Math.min(max, v));
}

/** Applique brightness et contraste à une valeur RGB */
function applyBrightnessContrast(
  r: number, g: number, b: number,
  brightness: number, contrast: number
): [number, number, number] {
  // Brightness: multiplication simple
  let nr = r * brightness;
  let ng = g * brightness;
  let nb = b * brightness;

  // Contraste: ((value - 128) * contrast) + 128
  nr = ((nr - 128) * contrast) + 128;
  ng = ((ng - 128) * contrast) + 128;
  nb = ((nb - 128) * contrast) + 128;

  return [clamp(nr), clamp(ng), clamp(nb)];
}

/** Applique une balance de chaleur (warmth) */
function applyWarmth(
  r: number, g: number, b: number,
  warmth: number
): [number, number, number] {
  if (warmth === 0) return [r, g, b];

  if (warmth > 0) {
    // Chaud : +rouge, +jaune (moins bleu)
    return [clamp(r + warmth * 30), clamp(g + warmth * 10), clamp(b - warmth * 30)];
  } else {
    // Froid : +bleu, +cyan (moins rouge)
    const w = Math.abs(warmth);
    return [clamp(r - w * 30), clamp(g + w * 5), clamp(b + w * 30)];
  }
}

/** Applique la désaturation (pour B&W) */
function desaturate(r: number, g: number, b: number, saturation: number): [number, number, number] {
  if (saturation === 1) return [r, g, b];
  if (saturation === 0) {
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    return [gray, gray, gray];
  }
  const gray = 0.299 * r + 0.587 * g + 0.114 * b;
  const nr = gray + (r - gray) * saturation;
  const ng = gray + (g - gray) * saturation;
  const nb = gray + (b - gray) * saturation;
  return [clamp(nr), clamp(ng), clamp(nb)];
}

/** Calcule l'atténuation de vignette pour un pixel */
function vignetteFactor(x: number, y: number, w: number, h: number, strength: number): number {
  if (strength === 0) return 1;

  const cx = w / 2;
  const cy = h / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const normalized = dist / maxDist;

  // Courbe douce : commence à ~0.5, accélère vers les bords
  const factor = 1 - strength * Math.pow(normalized, 2.5);
  return Math.max(0.2, Math.min(1, factor));
}

/** Ajoute du grain aléatoire */
function addGrain(data: Uint8ClampedArray, strength: number): void {
  if (strength === 0) return;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * strength * 60;
    data[i] = clamp(data[i] + noise);
    data[i + 1] = clamp(data[i + 1] + noise);
    data[i + 2] = clamp(data[i + 2] + noise);
  }
}

/**
 * Fonction principale : applique un profil à une ImageData et retourne un nouveau canvas.
 */
export function applyProfile(
  imageData: ImageData,
  profile: ProfileDefinition
): HTMLCanvasElement {
  const { filter } = profile;
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d')!;

  // Copie les pixels
  const data = new Uint8ClampedArray(imageData.data);
  const w = imageData.width;
  const h = imageData.height;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      let r = data[idx];
      let g = data[idx + 1];
      let b = data[idx + 2];

      // Étape 1 : Brightness + Contraste
      [r, g, b] = applyBrightnessContrast(r, g, b, filter.brightness, filter.contrast);

      // Étape 2 : Saturation
      [r, g, b] = desaturate(r, g, b, filter.saturation);

      // Étape 3 : Warmth
      [r, g, b] = applyWarmth(r, g, b, filter.warmth);

      // Étape 4 : Vignettage (assombrit les bords)
      const vig = vignetteFactor(x, y, w, h, filter.vignette);
      data[idx] = clamp(r * vig);
      data[idx + 1] = clamp(g * vig);
      data[idx + 2] = clamp(b * vig);
    }
  }

  // Étape 5 : Grain (appliqué sur tout le tableau)
  addGrain(data, filter.grain);

  const newImageData = new ImageData(data, w, h);
  ctx.putImageData(newImageData, 0, 0);

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