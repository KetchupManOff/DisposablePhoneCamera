import type { ColorProfile } from '../types';

export interface ProfileDefinition {
  id: ColorProfile;
  label: string;
  emoji: string;
  description: string;
  /** Réglages de courbes RGB appliqués via Canvas */
  filter: {
    brightness: number;  // 0-2, 1 = normal
    contrast: number;    // 0-2, 1 = normal
    saturation: number;  // 0-2, 1 = normal
    warmth: number;      // -1 (bleu/froid) à 1 (jaune/chaud)
    vignette: number;    // 0-1, intensité du vignettage
    grain: number;       // 0-1, intensité du grain
  };
}

export const PROFILES: Record<ColorProfile, ProfileDefinition> = {
  'kodak-gold': {
    id: 'kodak-gold',
    label: 'Kodak Gold',
    emoji: '🎞️',
    description: 'Chaud, doré, saturé — l\'icône des années 90',
    filter: {
      brightness: 1.05,
      contrast: 1.15,
      saturation: 1.3,
      warmth: 0.4,
      vignette: 0.35,
      grain: 0.15,
    },
  },
  'fuji-superia': {
    id: 'fuji-superia',
    label: 'Fuji Superia',
    emoji: '🌿',
    description: 'Vert profond, tons froids, cyan subtil',
    filter: {
      brightness: 1.0,
      contrast: 1.2,
      saturation: 1.1,
      warmth: -0.2,
      vignette: 0.3,
      grain: 0.1,
    },
  },
  'bw-tri-x': {
    id: 'bw-tri-x',
    label: 'Tri-X 400',
    emoji: '🖤',
    description: 'Noir & blanc contrasté, grain prononcé',
    filter: {
      brightness: 1.0,
      contrast: 1.5,
      saturation: 0,
      warmth: 0,
      vignette: 0.5,
      grain: 0.4,
    },
  },
  'polaroid': {
    id: 'polaroid',
    label: 'Polaroid',
    emoji: '📸',
    description: 'Pastel, doux, légèrement délavé',
    filter: {
      brightness: 1.1,
      contrast: 0.85,
      saturation: 0.8,
      warmth: 0.3,
      vignette: 0.4,
      grain: 0.05,
    },
  },
};