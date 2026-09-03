/**
 * Profils de film (émulsions) basés sur le document de référence
 * `refs/aboutTheCameras.md`.
 *
 * Chaque profil contient les paramètres physico-chimiques réels
 * de l'émulsion : sensibilité ISO, intensité de grain, courbe de
 * contraste, saturation, décalage de température Kelvin, points
 * noir/blanc RGB, et biais colorimétrique.
 *
 * Ces données pilotent le Pipeline Hybride de post-traitement
 * implémenté dans imageProcessor.ts.
 *
 * 2026-09-02 — Création à partir du document de référence.
 */

export interface FilmProfile {
  id: string;
  type: 'color' | 'instant_color' | 'monochrome';
  iso: number;
  grain_intensity: number;
  contrast_multiplier: number;
  saturation_multiplier: number;
  temperature_shift_kelvin: number;
  rgb_black_point: [number, number, number];
  rgb_white_point: [number, number, number];
  color_bias: string;
}

export const FILM_PROFILES: Record<string, FilmProfile> = {
  fujicolor_superia_400: {
    id: 'fujicolor_superia_400',
    type: 'color',
    iso: 400,
    grain_intensity: 0.40,
    contrast_multiplier: 1.15,
    saturation_multiplier: 1.20,
    temperature_shift_kelvin: -300,
    rgb_black_point: [10, 15, 20],
    rgb_white_point: [240, 250, 255],
    color_bias: 'green-cyan',
  },
  kodak_gold_800: {
    id: 'kodak_gold_800',
    type: 'color',
    iso: 800,
    grain_intensity: 0.65,
    contrast_multiplier: 1.10,
    saturation_multiplier: 1.25,
    temperature_shift_kelvin: 500,
    rgb_black_point: [20, 12, 10],
    rgb_white_point: [255, 250, 240],
    color_bias: 'yellow-red',
  },
  ilfocolor_400: {
    id: 'ilfocolor_400',
    type: 'color',
    iso: 400,
    grain_intensity: 0.50,
    contrast_multiplier: 1.20,
    saturation_multiplier: 1.05,
    temperature_shift_kelvin: 400,
    rgb_black_point: [25, 20, 15],
    rgb_white_point: [255, 245, 235],
    color_bias: 'vintage-warm',
  },
  lomo_color_400: {
    id: 'lomo_color_400',
    type: 'color',
    iso: 400,
    grain_intensity: 0.60,
    contrast_multiplier: 1.35,
    saturation_multiplier: 1.40,
    temperature_shift_kelvin: 100,
    rgb_black_point: [15, 5, 25],
    rgb_white_point: [255, 240, 255],
    color_bias: 'magenta-shift',
  },
  agfa_color_400: {
    id: 'agfa_color_400',
    type: 'color',
    iso: 400,
    grain_intensity: 0.45,
    contrast_multiplier: 1.00,
    saturation_multiplier: 0.90,
    temperature_shift_kelvin: -100,
    rgb_black_point: [15, 15, 15],
    rgb_white_point: [245, 245, 245],
    color_bias: 'muted-reds',
  },
  polaroid_600_color: {
    id: 'polaroid_600_color',
    type: 'instant_color',
    iso: 640,
    grain_intensity: 0.35,
    contrast_multiplier: 0.85,
    saturation_multiplier: 0.80,
    temperature_shift_kelvin: 300,
    rgb_black_point: [35, 45, 35],
    rgb_white_point: [250, 245, 235],
    color_bias: 'pastel-milky',
  },
  instax_color: {
    id: 'instax_color',
    type: 'instant_color',
    iso: 800,
    grain_intensity: 0.25,
    contrast_multiplier: 1.40,
    saturation_multiplier: 1.30,
    temperature_shift_kelvin: -400,
    rgb_black_point: [5, 5, 10],
    rgb_white_point: [240, 250, 255],
    color_bias: 'cold-punchy',
  },
  kodak_trix_400: {
    id: 'kodak_trix_400',
    type: 'monochrome',
    iso: 400,
    grain_intensity: 0.70,
    contrast_multiplier: 1.45,
    saturation_multiplier: 0.0,
    temperature_shift_kelvin: 0,
    rgb_black_point: [0, 0, 0],
    rgb_white_point: [255, 255, 255],
    color_bias: 'none',
  },
  ilford_hp5_400: {
    id: 'ilford_hp5_400',
    type: 'monochrome',
    iso: 400,
    grain_intensity: 0.45,
    contrast_multiplier: 1.05,
    saturation_multiplier: 0.0,
    temperature_shift_kelvin: 0,
    rgb_black_point: [15, 15, 15],
    rgb_white_point: [240, 240, 240],
    color_bias: 'none',
  },
  ilford_xp2_400: {
    id: 'ilford_xp2_400',
    type: 'monochrome',
    iso: 400,
    grain_intensity: 0.15,
    contrast_multiplier: 0.90,
    saturation_multiplier: 0.0,
    temperature_shift_kelvin: 0,
    rgb_black_point: [25, 25, 25],
    rgb_white_point: [245, 245, 245],
    color_bias: 'none',
  },
  lomo_lady_grey_400: {
    id: 'lomo_lady_grey_400',
    type: 'monochrome',
    iso: 400,
    grain_intensity: 0.55,
    contrast_multiplier: 1.25,
    saturation_multiplier: 0.0,
    temperature_shift_kelvin: 0,
    rgb_black_point: [5, 5, 5],
    rgb_white_point: [250, 250, 250],
    color_bias: 'none',
  },
};

export type FilmProfileId = keyof typeof FILM_PROFILES;

/**
 * Résout le profil film à partir d'un ID de film profile.
 */
export function getFilmProfile(id: string): FilmProfile | null {
  return FILM_PROFILES[id] ?? null;
}