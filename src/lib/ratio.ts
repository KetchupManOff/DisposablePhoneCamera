import type { AspectRatio, Orientation } from '../types';

/**
 * Ratio largeur / hauteur de base, stocké sur le projet.
 * Il est toujours exprimé au format paysage ('3:2', '16:9', etc.),
 * '1:1' étant neutre.
 */
const BASE_RATIOS: Record<AspectRatio, number> = {
  '1:1': 1,
  '3:2': 3 / 2,
  '4:3': 4 / 3,
  '16:9': 16 / 9,
};

/**
 * Ratio effectif (largeur / hauteur) après application de l'orientation.
 * En portrait, le ratio est inversé : '3:2' devient 2:3, etc.
 * '1:1' reste inchangé quel que soit le mode.
 */
export function getEffectiveRatio(
  aspectRatio: AspectRatio,
  orientation: Orientation = 'landscape',
): number {
  const base = BASE_RATIOS[aspectRatio];
  return orientation === 'portrait' ? 1 / base : base;
}

/**
 * Étiquette lisible du ratio effectif (ex : '3:2' ou '2:3').
 */
export function getRatioLabel(
  aspectRatio: AspectRatio,
  orientation: Orientation = 'landscape',
): string {
  if (aspectRatio === '1:1') return '1:1';
  const [w, h] = aspectRatio.split(':');
  return orientation === 'portrait' ? `${h}:${w}` : `${w}:${h}`;
}
