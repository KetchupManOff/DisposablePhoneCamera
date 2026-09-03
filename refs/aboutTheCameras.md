Contexte et instructions de simulation :
Ce document sert de référence absolue pour les paramètres de simulation des appareils photo. Tu dois baser toute ta logique sur ces données.

Règle de gestion des bordures (Force_Frame) :
Cet attribut contrôle l'application du cadre photographique (les marges blanches autour de l'image).

Si la valeur est un identifiant (ex: "polaroid_classic") : Ce style de bordure est imposé pour respecter le format physique de l'appareil. L'utilisateur n'a pas le choix du cadre.

Si la valeur est false : L'appareil n'impose aucune bordure. L'utilisateur a donc la liberté de choisir le style de rebord de son choix (ou l'absence de bordure) directement dans le menu de configuration du rouleau.

L'approche recommandée : Le Pipeline Hybride
Pour un réalisme maximal, ton backend (ou le moteur de rendu client) devrait exécuter un Shader de post-traitement en cascade structuré ainsi :

1. Conversion d'espace colorimétrique et Température de couleur

Convertir l'image d'entrée en espace linéaire.

Appliquer le temperature_shift_kelvin en utilisant une matrice de balance des blancs ou un déplacement de coordonnées sur l'axe planckien.

2. Courbes de transfert de ton (Tone Mapping) & Points Noir/Blanc

Au lieu d'un simple clamp, utilise tes valeurs rgb_black_point et rgb_white_point pour redéfinir les limites du signal.

Implémenter une courbe de type Sigmoïde ou Filmish Tone Curve pilotée par le contrast_multiplier. Cela permet d'obtenir ce fameux "toe" (ombres douces) et "shoulder" (hautes lumières compressées) typique de la chimie.

3. Altération des canaux de couleur (Color Matrix & Bias)

Appliquer les multiplicateurs de saturation (saturation_multiplier).

Injecter les biais colorimétriques spécifiques du profil (ex: pousser subtilement les rouges/jaunes dans les ombres pour le Kodak Gold, ou les cyans pour le Fuji).

4. Génération procédurale du grain (Crucial pour le réalisme)

Ne pas utiliser une image de grain fixe en overlay (effet répétitif visible).

Générer un bruit de Perlin ou un bruit bleu (Blue Noise) dans le shader, modulé par la luminance de l'image (le grain doit être plus visible dans les tons moyens/sombres et s'estomper dans les blancs purs, comme sur un vrai négatif).

Appliquer l'intensité selon ton paramètre grain_intensity.

5. Effets optiques et chimiques spécifiques (Optionnel mais "plus vrai que nature")

Halation : Un léger halo rouge/orangé autour des sources lumineuses très intenses (très prononcé sur le Kodak et le Polaroid).

Vignetage optique : Simulé via une formule radiale pour imiter les lentilles en plastique des appareils jetables (QuickSnap, LeBox).

{
  "simulation_config": {
    "version": "1.0",
    "global_settings": {
      "unit_default": "percent"
    }
  },
  "cameras": {
    "Fujifilm QuickSnap": {
      "Force_Frame": false,
      "film_profile": "fujicolor_superia_400"
    },
    "Ilford ilfocolor Rapid Retro Edition": {
      "Force_Frame": false,
      "film_profile": "ilfocolor_400"
    },
    "Kodak funsaver": {
      "Force_Frame": false,
      "film_profile": "kodak_gold_800"
    },
    "Lomography Simple Use": {
      "Force_Frame": false,
      "film_profile": "lomo_color_400"
    },
    "Lomography Simple Use B&W": {
      "Force_Frame": false,
      "film_profile": "lomo_lady_grey_400"
    },
    "Ilford HP5 Plus": {
      "Force_Frame": false,
      "film_profile": "ilford_hp5_400"
    },
    "Ilford XP2 Super": {
      "Force_Frame": false,
      "film_profile": "ilford_xp2_400"
    },
    "Agfaphoto LeBox": {
      "Force_Frame": false,
      "film_profile": "agfa_color_400"
    },
    "Kodak Tri-X 400": {
      "Force_Frame": false,
      "film_profile": "kodak_trix_400"
    },
    "Polaroid 600 (onestep)": {
      "Force_Frame": "polaroid_classic",
      "film_profile": "polaroid_600_color"
    },
    "Fujifilm Instax Mini": {
      "Force_Frame": "instax_mini",
      "film_profile": "instax_color"
    },
    "Fujifilm Instax Wide": {
      "Force_Frame": "instax_wide",
      "film_profile": "instax_color"
    }
  },
  "film_profiles": {
    "fujicolor_superia_400": {
      "type": "color",
      "iso": 400,
      "grain_intensity": 0.40,
      "contrast_multiplier": 1.15,
      "saturation_multiplier": 1.20,
      "temperature_shift_kelvin": -300,
      "rgb_black_point": [10, 15, 20],
      "rgb_white_point": [240, 250, 255],
      "color_bias": "green-cyan"
    },
    "kodak_gold_800": {
      "type": "color",
      "iso": 800,
      "grain_intensity": 0.65,
      "contrast_multiplier": 1.10,
      "saturation_multiplier": 1.25,
      "temperature_shift_kelvin": 500,
      "rgb_black_point": [20, 12, 10],
      "rgb_white_point": [255, 250, 240],
      "color_bias": "yellow-red"
    },
    "ilfocolor_400": {
      "type": "color",
      "iso": 400,
      "grain_intensity": 0.50,
      "contrast_multiplier": 1.20,
      "saturation_multiplier": 1.05,
      "temperature_shift_kelvin": 400,
      "rgb_black_point": [25, 20, 15],
      "rgb_white_point": [255, 245, 235],
      "color_bias": "vintage-warm"
    },
    "lomo_color_400": {
      "type": "color",
      "iso": 400,
      "grain_intensity": 0.60,
      "contrast_multiplier": 1.35,
      "saturation_multiplier": 1.40,
      "temperature_shift_kelvin": 100,
      "rgb_black_point": [15, 5, 25],
      "rgb_white_point": [255, 240, 255],
      "color_bias": "magenta-shift"
    },
    "agfa_color_400": {
      "type": "color",
      "iso": 400,
      "grain_intensity": 0.45,
      "contrast_multiplier": 1.00,
      "saturation_multiplier": 0.90,
      "temperature_shift_kelvin": -100,
      "rgb_black_point": [15, 15, 15],
      "rgb_white_point": [245, 245, 245],
      "color_bias": "muted-reds"
    },
    "polaroid_600_color": {
      "type": "instant_color",
      "iso": 640,
      "grain_intensity": 0.35,
      "contrast_multiplier": 0.85,
      "saturation_multiplier": 0.80,
      "temperature_shift_kelvin": 300,
      "rgb_black_point": [35, 45, 35],
      "rgb_white_point": [250, 245, 235],
      "color_bias": "pastel-milky"
    },
    "instax_color": {
      "type": "instant_color",
      "iso": 800,
      "grain_intensity": 0.25,
      "contrast_multiplier": 1.40,
      "saturation_multiplier": 1.30,
      "temperature_shift_kelvin": -400,
      "rgb_black_point": [5, 5, 10],
      "rgb_white_point": [240, 250, 255],
      "color_bias": "cold-punchy"
    },
    "kodak_trix_400": {
      "type": "monochrome",
      "iso": 400,
      "grain_intensity": 0.70,
      "contrast_multiplier": 1.45,
      "saturation_multiplier": 0.0,
      "temperature_shift_kelvin": 0,
      "rgb_black_point": [0, 0, 0],
      "rgb_white_point": [255, 255, 255],
      "color_bias": "none"
    },
    "ilford_hp5_400": {
      "type": "monochrome",
      "iso": 400,
      "grain_intensity": 0.45,
      "contrast_multiplier": 1.05,
      "saturation_multiplier": 0.0,
      "temperature_shift_kelvin": 0,
      "rgb_black_point": [15, 15, 15],
      "rgb_white_point": [240, 240, 240],
      "color_bias": "none"
    },
    "ilford_xp2_400": {
      "type": "monochrome",
      "iso": 400,
      "grain_intensity": 0.15,
      "contrast_multiplier": 0.90,
      "saturation_multiplier": 0.0,
      "temperature_shift_kelvin": 0,
      "rgb_black_point": [25, 25, 25],
      "rgb_white_point": [245, 245, 245],
      "color_bias": "none"
    },
    "lomo_lady_grey_400": {
      "type": "monochrome",
      "iso": 400,
      "grain_intensity": 0.55,
      "contrast_multiplier": 1.25,
      "saturation_multiplier": 0.0,
      "temperature_shift_kelvin": 0,
      "rgb_black_point": [5, 5, 5],
      "rgb_white_point": [250, 250, 250],
      "color_bias": "none"
    }
  },
  "border_presets": [
    {
      "id": "polaroid_classic",
      "name": "Polaroid Classique",
      "description": "Bordure inférieure très large idéale pour écrire un mot, côtés et haut réduits.",
      "margins_percent": { "top": 5.0, "bottom": 22.0, "left": 5.0, "right": 5.0 }
    },
    {
      "id": "top_bottom_heavy",
      "name": "Bandes Haut & Bas",
      "description": "Style cinématographique avec bordures verticales élargies et côtés étroits.",
      "margins_percent": { "top": 12.0, "bottom": 12.0, "left": 4.0, "right": 4.0 }
    },
    {
      "id": "slim",
      "name": "Bordures Slim",
      "description": "Fineté minimale pour encadrer subtilement l'image.",
      "margins_percent": { "top": 2.5, "bottom": 2.5, "left": 2.5, "right": 2.5 }
    },
    {
      "id": "wide_gallery",
      "name": "Bordures Larges / Galerie",
      "description": "Large passe-partout uniforme donnant un aspect d'exposition d'art.",
      "margins_percent": { "top": 15.0, "bottom": 15.0, "left": 15.0, "right": 15.0 }
    },
    {
      "id": "retro_asymmetric",
      "name": "Rétro Cartoline",
      "description": "Équilibre vintage avec une base légèrement plus lourde que le haut.",
      "margins_percent": { "top": 8.0, "bottom": 14.0, "left": 8.0, "right": 8.0 }
    },
    {
      "id": "instax_mini",
      "name": "Instax Mini",
      "description": "Format portrait typique de Fujifilm.",
      "margins_percent": { "top": 6.0, "bottom": 22.0, "left": 7.5, "right": 7.5 }
    },
    {
      "id": "instax_wide",
      "name": "Instax Wide",
      "description": "Format paysage étendu de Fujifilm.",
      "margins_percent": { "top": 6.0, "bottom": 22.0, "left": 4.0, "right": 4.0 }
    }
  ]
}