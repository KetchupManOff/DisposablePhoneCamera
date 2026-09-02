/**
 * UI Themes — Chaque caméra jetable a sa propre identité visuelle.
 *
 * Les couleurs sont appliquées via des custom properties CSS sur :root[data-theme].
 * Cela permet de changer l'apparence de TOUTE l'interface (chrome, bordures,
 * accents) en fonction de la caméra sélectionnée.
 */

export interface ThemeDefinition {
  id: string;
  /** Nom lisible */
  label: string;
  /** Couleurs de l'interface */
  colors: {
    bg: string;       // Fond principal
    surface: string;  // Cartes / panneaux
    border: string;   // Bordures
    text: string;     // Texte principal
    muted: string;    // Texte secondaire
    accent: string;   // Couleur d'accentuation (boutons, sélection)
    accentRgb: string;// Version RGB pour rgba(var(--color-accent-rgb), alpha)
    danger: string;   // Actions destructrices
  };
}

/** Convertit un hex (#RRGGBB) en triplet RGB "R, G, B" */
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

/**
 * Thème par défaut (utilisé quand aucun projet n'est actif ou en fallback).
 * Inspiré du viseur rétro classique.
 */
export const DEFAULT_THEME: ThemeDefinition = {
  id: 'default',
  label: 'Classic',
  colors: {
    bg: '#1A180E',
    surface: '#2C2818',
    border: '#4A4028',
    text: '#F5ECD7',
    muted: '#A89570',
    accent: '#E5B84C',
    accentRgb: hexToRgb('#E5B84C'),
    danger: '#D64045',
  },
};

export const THEMES: Record<string, ThemeDefinition> = {
  // --- Fujifilm QuickSnap (1986) — Vert Fuji iconique ---
  'fujifilm-quicksnap': {
    id: 'fujifilm-quicksnap',
    label: 'Fujifilm QuickSnap',
    colors: {
      bg: '#cce6d2',
      surface: '#a3d1ac',
      border: '#7abb85',
      text: '#114a22',
      muted: '#256d39',
      accent: '#2ECC40',
      accentRgb: hexToRgb('#2ECC40'),
      danger: '#E74C3C',
    },
  },

  // --- Kodak FunSaver — Jaune/rouge chaud Kodak ---
  'kodak-funsaver': {
    id: 'kodak-funsaver',
    label: 'Kodak FunSaver',
    colors: {
      bg: '#c4a03d',
      surface: '#ffda73',
      border: '#e6b939',
      text: '#664900',
      muted: '#997300',
      accent: '#FF3B30',
      accentRgb: hexToRgb('#FF3B30'),
      danger: '#E74C3C',
    },
  },

  // --- Lomography Simple Use Color — Turquoise funky ---
  'lomo-simple-color': {
    id: 'lomo-simple-color',
    label: 'Lomography Simple Use',
    colors: {
      bg: '#cceeff',
      surface: '#80ccff',
      border: '#33aaff',
      text: '#004466',
      muted: '#0077b3',
      accent: '#FF007F',
      accentRgb: hexToRgb('#FF007F'),
      danger: '#FF4081',
    },
  },

  // --- Lomography Simple Use B&W — Monochrome élégant ---
  'lomo-simple-bw': {
    id: 'lomo-simple-bw',
    label: 'Lomography B&W',
    colors: {
      bg: '#e6e6e6',
      surface: '#cccccc',
      border: '#999999',
      text: '#1a1a1a',
      muted: '#4d4d4d',
      accent: '#FF3B30',
      accentRgb: hexToRgb('#FF3B30'),
      danger: '#FF5252',
    },
  },

  // --- Ilford HP5 Plus — N&B classique au grain visible ---
  'ilford-hp5': {
    id: 'ilford-hp5',
    label: 'Ilford HP5 Plus',
    colors: {
      bg: '#d9e0d9',
      surface: '#a3b3a3',
      border: '#668066',
      text: '#0f1a0f',
      muted: '#2d4d2d',
      accent: '#4CAF50',
      accentRgb: hexToRgb('#4CAF50'),
      danger: '#D32F2F',
    },
  },

  // --- Ilford XP2 Super — N&B chromogénique ---
  'ilford-xp2': {
    id: 'ilford-xp2',
    label: 'Ilford XP2 Super',
    colors: {
      bg: '#e6d9e6',
      surface: '#c299c2',
      border: '#996699',
      text: '#331a33',
      muted: '#663366',
      accent: '#9C27B0',
      accentRgb: hexToRgb('#9C27B0'),
      danger: '#C0392B',
    },
  },

  // --- AgfaPhoto LeBox — Rouge Agfa allemand ---
  'agfa-lebox': {
    id: 'agfa-lebox',
    label: 'AgfaPhoto LeBox',
    colors: {
      bg: '#ffd9d9',
      surface: '#ff9999',
      border: '#e64d4d',
      text: '#660000',
      muted: '#990000',
      accent: '#000000',
      accentRgb: hexToRgb('#000000'),
      danger: '#D32F2F',
    },
  },

  // --- Kodak Tri-X 400 — N&B dramatique, très contrasté ---
  'kodak-tri-x': {
    id: 'kodak-tri-x',
    label: 'Kodak Tri-X 400',
    colors: {
      bg: '#f2f2f2',
      surface: '#d9d9d9',
      border: '#b3b3b3',
      text: '#000000',
      muted: '#404040',
      accent: '#FFEB3B',
      accentRgb: hexToRgb('#FFEB3B'),
      danger: '#E74C3C',
    },
  },

  // --- Polaroid 600 (OneStep) — Arc-en-ciel rétro ---
  'polaroid-600': {
    id: 'polaroid-600',
    label: 'Polaroid 600',
    colors: {
      bg: '#f0f4f8',
      surface: '#cfdbe8',
      border: '#a3bbd1',
      text: '#1f3a52',
      muted: '#3b6a94',
      accent: '#F06292',
      accentRgb: hexToRgb('#F06292'),
      danger: '#EF5350',
    },
  },

  // --- Fujifilm Instax Mini — Pastel rose bonbon ---
  'instax-mini': {
    id: 'instax-mini',
    label: 'Instax Mini',
    colors: {
      bg: '#ffe6f2',
      surface: '#ffb3d9',
      border: '#ff66b3',
      text: '#660033',
      muted: '#b30059',
      accent: '#00BCD4',
      accentRgb: hexToRgb('#00BCD4'),
      danger: '#E53935',
    },
  },

  // --- Fujifilm Instax Wide — Pastel bleu ciel ---
  'instax-wide': {
    id: 'instax-wide',
    label: 'Instax Wide',
    colors: {
      bg: '#e6f7ff',
      surface: '#99dcff',
      border: '#33bbff',
      text: '#00334d',
      muted: '#006699',
      accent: '#FF9800',
      accentRgb: hexToRgb('#FF9800'),
      danger: '#EF5350',
    },
  },

  // --- Ilford Ilfocolor Rapid Retro Edition — Orange chaud / rétro ---
  'ilford-ilfocolor-rapid': {
    id: 'ilford-ilfocolor-rapid',
    label: 'Ilford Ilfocolor Rapid Retro Edition',
    colors: {
      bg: '#ffe6cc',
      surface: '#ffb366',
      border: '#e68a00',
      text: '#663d00',
      muted: '#995c00',
      accent: '#2196F3',
      accentRgb: hexToRgb('#2196F3'),
      danger: '#E53935',
    },
  },
};

/** Récupère un thème par son id, avec repli sur le thème par défaut. */
export function getTheme(themeId: string | null | undefined): ThemeDefinition {
  if (!themeId) return DEFAULT_THEME;
  return THEMES[themeId] ?? DEFAULT_THEME;
}

/** Applique les couleurs d'un thème sur :root (document.documentElement). */
export function applyTheme(theme: ThemeDefinition): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme.id);
  for (const [key, value] of Object.entries(theme.colors)) {
    const cssKey = key === 'accentRgb' ? 'accent-rgb' : key;
    root.style.setProperty(`--color-${cssKey}`, value);
  }
}

/** Applique le thème par défaut. */
export function applyDefaultTheme(): void {
  applyTheme(DEFAULT_THEME);
}