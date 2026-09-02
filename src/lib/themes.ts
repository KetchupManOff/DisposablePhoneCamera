/**
 * UI Themes — Chaque caméra jetable a sa propre identité visuelle.
 *
 * Les couleurs sont appliquées via des custom properties CSS sur :root[data-theme].
 * Cela permet de changer l'apparence de TOUTE l'interface (chrome, bordures,
 * accents) en fonction de la caméra sélectionnée.
 */

export interface ThemeDefinition {
  id: string;
  /** Sombre ou clair (pour color-scheme et meta tags) */
  isDark: boolean;
  label: string;
  /** Couleurs de l'interface */
  colors: {
    bg: string;       // Fond principal
    surface: string;  // Cartes / panneaux
    border: string;   // Bordures
    text: string;     // Texte principal
    muted: string;    // Texte secondaire
    accent: string;   // Couleur d'accentuation
    accentContent: string; // Texte SUR l'accent (ex: blanc ou noir)
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
  isDark: true,
  colors: {
    bg: '#1A180E',
    surface: '#2C2818',
    border: '#4A4028',
    text: '#F5ECD7',
    muted: '#A89570',
    accent: '#E5B84C',
    accentContent: '#1A180E',
    accentRgb: hexToRgb('#E5B84C'),
    danger: '#D64045',
  },
};

export const THEMES: Record<string, ThemeDefinition> = {
  // --- Fujifilm QuickSnap (1986) — Vert Fuji iconique ---
  'fujifilm-quicksnap': {
    id: 'fujifilm-quicksnap',
    label: 'Fujifilm QuickSnap',
    isDark: false,
    colors: {
      bg: '#cce6d2',
      surface: '#a3d1ac',
      border: '#7abb85',
      text: '#0a3a1a', // Assombri
      muted: '#1e4d2b', // Assombri
      accent: '#2ECC40',
      accentContent: '#FFFFFF',
      accentRgb: hexToRgb('#2ECC40'),
      danger: '#E74C3C',
    },
  },

  // --- Kodak FunSaver — Jaune/rouge chaud Kodak ---
  'kodak-funsaver': {
    id: 'kodak-funsaver',
    label: 'Kodak FunSaver',
    isDark: false,
    colors: {
      bg: '#ffebb3',
      surface: '#ffda73',
      border: '#e6b939',
      text: '#4d3700', // Assombri
      muted: '#7a5700', // Assombri
      accent: '#FF3B30',
      accentContent: '#FFFFFF',
      accentRgb: hexToRgb('#FF3B30'),
      danger: '#E74C3C',
    },
  },

  // --- Lomography Simple Use Color — Turquoise funky ---
  'lomo-simple-color': {
    id: 'lomo-simple-color',
    label: 'Lomography Simple Use',
    isDark: false,
    colors: {
      bg: '#cceeff',
      surface: '#80ccff',
      border: '#33aaff',
      text: '#002a40', // Assombri
      muted: '#005280', // Assombri
      accent: '#FF007F',
      accentContent: '#FFFFFF',
      accentRgb: hexToRgb('#FF007F'),
      danger: '#FF4081',
    },
  },

  // --- Lomography Simple Use B&W — Monochrome élégant ---
  'lomo-simple-bw': {
    id: 'lomo-simple-bw',
    label: 'Lomography B&W',
    isDark: false,
    colors: {
      bg: '#e6e6e6',
      surface: '#cccccc',
      border: '#999999',
      text: '#0d0d0d', // Assombri
      muted: '#333333', // Assombri
      accent: '#FF3B30',
      accentContent: '#FFFFFF',
      accentRgb: hexToRgb('#FF3B30'),
      danger: '#FF5252',
    },
  },

  // --- Ilford HP5 Plus — N&B classique au grain visible ---
  'ilford-hp5': {
    id: 'ilford-hp5',
    label: 'Ilford HP5 Plus',
    isDark: false,
    colors: {
      bg: '#d9e0d9',
      surface: '#a3b3a3',
      border: '#668066',
      text: '#0a1a0a', // Assombri
      muted: '#2a4d2a', // Assombri
      accent: '#2d5a2d', // Assombri pour contraste
      accentContent: '#FFFFFF',
      accentRgb: hexToRgb('#2d5a2d'),
      danger: '#D32F2F',
    },
  },

  // --- Ilford XP2 Super — N&B chromogénique ---
  'ilford-xp2': {
    id: 'ilford-xp2',
    label: 'Ilford XP2 Super',
    isDark: false,
    colors: {
      bg: '#e6d9e6',
      surface: '#c299c2',
      border: '#996699',
      text: '#2a0a2a', // Assombri
      muted: '#4a1e4a', // Assombri
      accent: '#6A1B9A', // Assombri pour contraste
      accentContent: '#FFFFFF',
      accentRgb: hexToRgb('#6A1B9A'),
      danger: '#C0392B',
    },
  },

  // --- AgfaPhoto LeBox — Rouge Agfa allemand ---
  'agfa-lebox': {
    id: 'agfa-lebox',
    label: 'AgfaPhoto LeBox',
    isDark: false,
    colors: {
      bg: '#ffd9d9',
      surface: '#ff9999',
      border: '#e64d4d',
      text: '#4d0000', // Assombri
      muted: '#800000', // Assombri
      accent: '#000000',
      accentContent: '#FFFFFF',
      accentRgb: hexToRgb('#000000'),
      danger: '#D32F2F',
    },
  },

  // --- Kodak Tri-X 400 — N&B dramatique, très contrasté ---
  'kodak-tri-x': {
    id: 'kodak-tri-x',
    label: 'Kodak Tri-X 400',
    isDark: false,
    colors: {
      bg: '#f2f2f2',
      surface: '#d9d9d9',
      border: '#b3b3b3',
      text: '#000000',
      muted: '#262626', // Assombri
      accent: '#bfae00', // Assombri (jaune foncé pour contraste sur blanc)
      accentContent: '#FFFFFF',
      accentRgb: hexToRgb('#bfae00'),
      danger: '#E74C3C',
    },
  },

  // --- Polaroid 600 (OneStep) — Arc-en-ciel rétro ---
  'polaroid-600': {
    id: 'polaroid-600',
    label: 'Polaroid 600',
    isDark: false,
    colors: {
      bg: '#f0f4f8',
      surface: '#cfdbe8',
      border: '#a3bbd1',
      text: '#0d1a26', // Assombri
      muted: '#264563', // Assombri
      accent: '#D81B60', // Assombri (rose foncé)
      accentContent: '#FFFFFF',
      accentRgb: hexToRgb('#D81B60'),
      danger: '#EF5350',
    },
  },

  // --- Fujifilm Instax Mini — Pastel rose bonbon ---
  'instax-mini': {
    id: 'instax-mini',
    label: 'Instax Mini',
    isDark: false,
    colors: {
      bg: '#ffe6f2',
      surface: '#ffb3d9',
      border: '#ff66b3',
      text: '#4d0026', // Assombri
      muted: '#800040', // Assombri
      accent: '#00838F', // Assombri (cyan foncé)
      accentContent: '#FFFFFF',
      accentRgb: hexToRgb('#00838F'),
      danger: '#E53935',
    },
  },

  // --- Fujifilm Instax Wide — Pastel bleu ciel ---
  'instax-wide': {
    id: 'instax-wide',
    label: 'Instax Wide',
    isDark: false,
    colors: {
      bg: '#e6f7ff',
      surface: '#99dcff',
      border: '#33bbff',
      text: '#002233', // Assombri
      muted: '#004466', // Assombri
      accent: '#E65100', // Assombri (orange foncé)
      accentContent: '#FFFFFF',
      accentRgb: hexToRgb('#E65100'),
      danger: '#EF5350',
    },
  },

  // --- Ilford Ilfocolor Rapid Retro Edition — Orange chaud / rétro ---
  'ilford-ilfocolor-rapid': {
    id: 'ilford-ilfocolor-rapid',
    label: 'Ilford Ilfocolor Rapid Retro Edition',
    isDark: false,
    colors: {
      bg: '#ffe6cc',
      surface: '#ffb366',
      border: '#e68a00',
      text: '#331f00', // Assombri
      muted: '#663d00', // Assombri
      accent: '#0D47A1', // Assombri (bleu foncé)
      accentContent: '#FFFFFF',
      accentRgb: hexToRgb('#0D47A1'),
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
  
  // Appliquer les variables CSS
  for (const [key, value] of Object.entries(theme.colors)) {
    const cssKey = key === 'accentRgb' ? 'accent-rgb' : key;
    root.style.setProperty(`--color-${cssKey}`, value);
  }

  // Color-scheme pour le navigateur (crucial pour Arc/Chrome)
  root.style.setProperty('color-scheme', theme.isDark ? 'dark' : 'light');

  // Mettre à jour la balise meta theme-color (utilisée par Arc pour colorer l'UI)
  let metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (!metaThemeColor) {
    metaThemeColor = document.createElement('meta');
    metaThemeColor.setAttribute('name', 'theme-color');
    document.head.appendChild(metaThemeColor);
  }
  metaThemeColor.setAttribute('content', theme.colors.bg);

  // Mettre à jour les styles du body pour la cohérence
  document.body.style.backgroundColor = theme.colors.bg;
  document.body.style.color = theme.colors.text;
}

/** Applique le thème par défaut. */
export function applyDefaultTheme(): void {
  applyTheme(DEFAULT_THEME);
}