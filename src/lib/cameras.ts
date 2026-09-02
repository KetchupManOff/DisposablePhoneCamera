import type { ColorProfile, AspectRatio } from '../types';

/**
 * Catalogue de caméras rétro / jetables simulées.
 *
 * Chaque entrée associe la caméra à :
 *  - son émulsion réelle (LUT `colorProfile`) ;
 *  - son format d'image natif (`aspectRatio`) ;
 *  - son nombre de poses réel (`exposures`).
 *
 * Sources (recherche en ligne, août 2026) :
 *  - Wikipedia — « Disposable camera » / « Single-use camera » : QuickSnap (Fujifilm,
 *    1986, 35 mm), Kodak FunSaver (1989, 35 mm), déclinaisons 27/39 poses ;
 *  - Wikipedia — « Instax » : Mini (62×46 mm ≈ 4:3), Wide (99×62 mm ≈ 3:2),
 *    Square (62×62 mm), ISO 800, colorant instantané ;
 *  - Ilford Photo — HP5 Plus Single Use (ISO 400 N&B, 27 poses) et XP2 Super Single Use
 *    (ISO 400 N&B chromogénique C41, 27 poses) ;
 *  - Lomography — Simple Use Film Camera Color Negative 400 (36 poses) et B&W
 *    Lady Grey 400 (36 poses) ;
 *  - AgfaPhoto — LeBox (film couleur 400, 27 poses).
 */

export interface CameraDefinition {
  id: string;
  label: string;
  manufacturer: string;
  emoji: string;
  description: string;
  /** Description en anglais. */
  descriptionEn: string;
  /** Émulsion / LUT appliqué (recherche des caractéristiques réelles) */
  colorProfile: ColorProfile;
  /** Format d'image natif de la caméra réelle */
  aspectRatio: AspectRatio;
  /** Nombre de poses réel (27 pour la plupart des jetables 35 mm) */
  exposures: number;
  /** Résumé technique affiché dans l'UI */
  specs: string;
  /** Résumé technique en anglais. */
  specsEn: string;
  /** Thème UI associé (palette de couleurs de l'interface) */
  themeId: string;
}

export const CAMERAS: CameraDefinition[] = [
  {
    id: 'fujifilm-quicksnap',
    label: 'Fujifilm QuickSnap',
    manufacturer: 'Fujifilm',
    emoji: '🎞️',
    description: 'Le jetable originel (1986). Fujicolor Superia 400, tons froids.',
    descriptionEn: 'The original disposable (1986). Fujicolor Superia 400, cool tones.',
    colorProfile: 'fuji-superia',
    aspectRatio: '3:2',
    exposures: 27,
    specs: '35 mm · ISO 400 · 27 poses · 3:2',
    specsEn: '35 mm · ISO 400 · 27 exposures · 3:2',
    themeId: 'fujifilm-quicksnap',
  },
  {
    id: 'kodak-funsaver',
    label: 'Kodak FunSaver',
    manufacturer: 'Kodak',
    emoji: '🔥',
    description: 'Kodak Max 800, chaud et punchy — le jetable culte américain.',
    descriptionEn: 'Kodak Max 800, warm and punchy — the iconic American disposable.',
    colorProfile: 'kodak-ultramax',
    aspectRatio: '3:2',
    exposures: 27,
    specs: '35 mm · ISO 800 · 27 poses · 3:2',
    specsEn: '35 mm · ISO 800 · 27 exposures · 3:2',
    themeId: 'kodak-funsaver',
  },
  {
    id: 'lomo-simple-color',
    label: 'Lomography Simple Use',
    manufacturer: 'Lomography',
    emoji: '🌈',
    description: 'Color Negative 400, saturation vive et vignettage marqué.',
    descriptionEn: 'Color Negative 400, vivid saturation and strong vignetting.',
    colorProfile: 'lomo-400',
    aspectRatio: '3:2',
    exposures: 36,
    specs: '35 mm · ISO 400 · 36 poses · 3:2',
    specsEn: '35 mm · ISO 400 · 36 exposures · 3:2',
    themeId: 'lomo-simple-color',
  },
  {
    id: 'lomo-simple-bw',
    label: 'Lomography Simple Use B&W',
    manufacturer: 'Lomography',
    emoji: '🕶️',
    description: 'Lady Grey 400, noir & blanc doux et contrasté.',
    descriptionEn: 'Lady Grey 400, soft and contrasty black & white.',
    colorProfile: 'lomo-lady-grey',
    aspectRatio: '3:2',
    exposures: 36,
    specs: '35 mm · ISO 400 N&B · 36 poses · 3:2',
    specsEn: '35 mm · ISO 400 B&W · 36 exposures · 3:2',
    themeId: 'lomo-simple-bw',
  },
  {
    id: 'ilford-hp5',
    label: 'Ilford HP5 Plus',
    manufacturer: 'Ilford',
    emoji: '🖤',
    description: 'HP5 Plus 400, le N&B classique au grain visible.',
    descriptionEn: 'HP5 Plus 400, the classic B&W with visible grain.',
    colorProfile: 'bw-hp5',
    aspectRatio: '3:2',
    exposures: 27,
    specs: '35 mm · ISO 400 N&B · 27 poses · 3:2',
    specsEn: '35 mm · ISO 400 B&W · 27 exposures · 3:2',
    themeId: 'ilford-hp5',
  },
  {
    id: 'ilford-xp2',
    label: 'Ilford XP2 Super',
    manufacturer: 'Ilford',
    emoji: '🤍',
    description: 'XP2 Super 400, N&B chromogénique fin et doux.',
    descriptionEn: 'XP2 Super 400, fine and smooth chromogenic B&W.',
    colorProfile: 'bw-xp2',
    aspectRatio: '3:2',
    exposures: 27,
    specs: '35 mm · ISO 400 N&B C41 · 27 poses · 3:2',
    specsEn: '35 mm · ISO 400 B&W C41 · 27 exposures · 3:2',
    themeId: 'ilford-xp2',
  },
  {
    id: 'agfa-lebox',
    label: 'AgfaPhoto LeBox',
    manufacturer: 'AgfaPhoto',
    emoji: '🔴',
    description: 'Film couleur 400, rendu neutre légèrement chaud.',
    descriptionEn: 'Color 400 film, neutral render with a slight warmth.',
    colorProfile: 'agfa-vista',
    aspectRatio: '3:2',
    exposures: 27,
    specs: '35 mm · ISO 400 · 27 poses · 3:2',
    specsEn: '35 mm · ISO 400 · 27 exposures · 3:2',
    themeId: 'agfa-lebox',
  },
  {
    id: 'kodak-tri-x',
    label: 'Kodak Tri-X 400',
    manufacturer: 'Kodak',
    emoji: '🎬',
    description: 'Tri-X 400, N&B très contrasté, grain prononcé.',
    descriptionEn: 'Tri-X 400, high-contrast B&W with pronounced grain.',
    colorProfile: 'bw-tri-x',
    aspectRatio: '3:2',
    exposures: 27,
    specs: '35 mm · ISO 400 N&B · 27 poses · 3:2',
    specsEn: '35 mm · ISO 400 B&W · 27 exposures · 3:2',
    themeId: 'kodak-tri-x',
  },
  {
    id: 'polaroid-600',
    label: 'Polaroid 600 (OneStep)',
    manufacturer: 'Polaroid',
    emoji: '📸',
    description: 'Instantané carré, pastel et délavé.',
    descriptionEn: 'Square instant film, pastel and faded.',
    colorProfile: 'polaroid',
    aspectRatio: '1:1',
    exposures: 8,
    specs: 'Instantané · ISO 640 · 8 poses · 1:1',
    specsEn: 'Instant · ISO 640 · 8 shots · 1:1',
    themeId: 'polaroid-600',
  },
  {
    id: 'instax-mini',
    label: 'Fujifilm Instax Mini',
    manufacturer: 'Fujifilm',
    emoji: '🧁',
    description: 'Instantané 62×46 mm, pastel chaud et doux.',
    descriptionEn: '62×46 mm instant film, warm soft pastel.',
    colorProfile: 'instax-mini',
    aspectRatio: '4:3',
    exposures: 10,
    specs: 'Instantané · ISO 800 · 10 poses · 62×46 mm',
    specsEn: 'Instant · ISO 800 · 10 shots · 62×46 mm',
    themeId: 'instax-mini',
  },
  {
    id: 'instax-wide',
    label: 'Fujifilm Instax Wide',
    manufacturer: 'Fujifilm',
    emoji: '🌅',
    description: 'Instantané panoramique 99×62 mm, pastel.',
    descriptionEn: '99×62 mm panoramic instant film, pastel.',
    colorProfile: 'instax-wide',
    aspectRatio: '3:2',
    exposures: 10,
    specs: 'Instantané · ISO 800 · 10 poses · 99×62 mm',
    specsEn: 'Instant · ISO 800 · 10 shots · 99×62 mm',
    themeId: 'instax-wide',
  },
  {
    id: 'ilford-ilfocolor-rapid',
    label: 'Ilford Ilfocolor Rapid Retro Edition',
    manufacturer: 'Ilford',
    emoji: '🍊',
    description: 'Ilford Ilfocolor Rapid Retro Edition. Film couleur 400, tons chauds et rétro.',
    descriptionEn: 'Ilford Ilfocolor Rapid Retro Edition. ISO 400 color film, warm retro tones.',
    colorProfile: 'agfa-vista',
    aspectRatio: '3:2',
    exposures: 27,
    specs: '35 mm · ISO 400 · 27 poses · 3:2',
    specsEn: '35 mm · ISO 400 · 27 exposures · 3:2',
    themeId: 'ilford-ilfocolor-rapid',
  },
];

export function getCamera(id: string | null | undefined): CameraDefinition | null {
  if (!id) return null;
  return CAMERAS.find((c) => c.id === id) ?? null;
}
