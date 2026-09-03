/**
 * Presets de bordures photographiques.
 *
 * Basé sur le document de référence `refs/aboutTheCameras.md`.
 * Chaque preset définit des marges en pourcentage de la dimension
 * la plus courte de l'image.
 *
 * Règle de gestion des bordures (Force_Frame) :
 * - Si la caméra a Force_Frame = "polaroid_classic" → ce preset est imposé
 * - Si la caméra a Force_Frame = false → l'utilisateur peut choisir librement
 *
 * 2026-09-02 — Création à partir du document de référence.
 */

export interface BorderMargins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface BorderPreset {
  id: string;
  name: string;
  description: string;
  margins_percent: BorderMargins;
}

export const BORDER_PRESETS: BorderPreset[] = [
  {
    id: 'polaroid_classic',
    name: 'Polaroid Classique',
    description: 'Bordure inférieure très large idéale pour écrire un mot, côtés et haut réduits.',
    margins_percent: { top: 5.0, bottom: 22.0, left: 5.0, right: 5.0 },
  },
  {
    id: 'top_bottom_heavy',
    name: 'Bandes Haut & Bas',
    description: 'Style cinématographique avec bordures verticales élargies et côtés étroits.',
    margins_percent: { top: 12.0, bottom: 12.0, left: 4.0, right: 4.0 },
  },
  {
    id: 'slim',
    name: 'Bordures Slim',
    description: 'Fineté minimale pour encadrer subtilement l\'image.',
    margins_percent: { top: 2.5, bottom: 2.5, left: 2.5, right: 2.5 },
  },
  {
    id: 'wide_gallery',
    name: 'Bordures Larges / Galerie',
    description: 'Large passe-partout uniforme donnant un aspect d\'exposition d\'art.',
    margins_percent: { top: 15.0, bottom: 15.0, left: 15.0, right: 15.0 },
  },
  {
    id: 'retro_asymmetric',
    name: 'Rétro Cartoline',
    description: 'Équilibre vintage avec une base légèrement plus lourde que le haut.',
    margins_percent: { top: 8.0, bottom: 14.0, left: 8.0, right: 8.0 },
  },
  {
    id: 'instax_mini',
    name: 'Instax Mini',
    description: 'Format portrait typique de Fujifilm.',
    margins_percent: { top: 6.0, bottom: 22.0, left: 7.5, right: 7.5 },
  },
  {
    id: 'instax_wide',
    name: 'Instax Wide',
    description: 'Format paysage étendu de Fujifilm.',
    margins_percent: { top: 6.0, bottom: 22.0, left: 4.0, right: 4.0 },
  },
];

/** Accès rapide par ID */
export const BORDER_PRESETS_MAP: Record<string, BorderPreset> = {};
for (const preset of BORDER_PRESETS) {
  BORDER_PRESETS_MAP[preset.id] = preset;
}

export function getBorderPreset(id: string): BorderPreset | null {
  return BORDER_PRESETS_MAP[id] ?? null;
}

/** Cadre par défaut quand l'utilisateur peut choisir → pas de cadre */
export const NO_BORDER_ID = '__none__';