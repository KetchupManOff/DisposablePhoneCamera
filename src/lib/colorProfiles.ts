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
    label: 'Kodak Gold 200',
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
  'kodak-ultramax': {
    id: 'kodak-ultramax',
    label: 'Kodak UltraMax 800',
    emoji: '🔥',
    description: 'Chaud et punchy, granuleux (ISO 800) — Kodak FunSaver',
    filter: {
      brightness: 1.02,
      contrast: 1.2,
      saturation: 1.35,
      warmth: 0.35,
      vignette: 0.3,
      grain: 0.18,
    },
  },
  'fuji-superia': {
    id: 'fuji-superia',
    label: 'Fuji Superia 400',
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
  'lomo-400': {
    id: 'lomo-400',
    label: 'Lomography 400',
    emoji: '🌈',
    description: 'Très saturé, vignettage marqué, tons chauds',
    filter: {
      brightness: 1.0,
      contrast: 1.25,
      saturation: 1.5,
      warmth: 0.3,
      vignette: 0.6,
      grain: 0.2,
    },
  },
  'lomo-lady-grey': {
    id: 'lomo-lady-grey',
    label: 'Lady Grey 400',
    emoji: '🕶️',
    description: 'Noir & blanc doux, contraste moyen, vignetté',
    filter: {
      brightness: 1.0,
      contrast: 1.3,
      saturation: 0,
      warmth: 0,
      vignette: 0.5,
      grain: 0.35,
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
  'bw-hp5': {
    id: 'bw-hp5',
    label: 'Ilford HP5 400',
    emoji: '🎞️',
    description: 'N&B classique, contraste modéré, grain visible',
    filter: {
      brightness: 1.0,
      contrast: 1.35,
      saturation: 0,
      warmth: 0,
      vignette: 0.35,
      grain: 0.32,
    },
  },
  'bw-xp2': {
    id: 'bw-xp2',
    label: 'Ilford XP2 400',
    emoji: '🤍',
    description: 'N&B fin et doux (chromogénique C41), grain discret',
    filter: {
      brightness: 1.02,
      contrast: 1.15,
      saturation: 0,
      warmth: 0,
      vignette: 0.25,
      grain: 0.18,
    },
  },
  'agfa-vista': {
    id: 'agfa-vista',
    label: 'Agfa Vista 400',
    emoji: '🔴',
    description: 'Couleurs neutres légèrement chaudes — AgfaPhoto LeBox',
    filter: {
      brightness: 1.02,
      contrast: 1.1,
      saturation: 1.15,
      warmth: 0.15,
      vignette: 0.3,
      grain: 0.14,
    },
  },
  'polaroid': {
    id: 'polaroid',
    label: 'Polaroid 600',
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
  'instax-mini': {
    id: 'instax-mini',
    label: 'Instax Mini',
    emoji: '🧁',
    description: 'Pastel chaud, doux, léger contraste — instantané',
    filter: {
      brightness: 1.08,
      contrast: 0.9,
      saturation: 0.85,
      warmth: 0.35,
      vignette: 0.25,
      grain: 0.06,
    },
  },
  'instax-wide': {
    id: 'instax-wide',
    label: 'Instax Wide',
    emoji: '🌅',
    description: 'Pastel panoramique, contraste doux — instantané',
    filter: {
      brightness: 1.05,
      contrast: 0.95,
      saturation: 0.9,
      warmth: 0.3,
      vignette: 0.2,
      grain: 0.08,
    },
  },
};