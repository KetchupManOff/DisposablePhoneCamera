import type { Orientation } from '../../types';

interface OrientationToggleProps {
  orientation: Orientation;
  onChange: () => void;
}

/**
 * Bouton rond compact de bascule d'orientation (portrait / paysage).
 * Affiche un rectangle vertical ou horizontal selon le mode actif.
 */
export function OrientationToggle({ orientation, onChange }: OrientationToggleProps) {
  const isPortrait = orientation === 'portrait';

  return (
    <button
      onClick={onChange}
      className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-vintage-border/50 flex items-center justify-center text-vintage-text hover:border-vintage-accent/60 transition-colors"
      aria-label={isPortrait ? 'Passer en paysage' : 'Passer en portrait'}
      title={isPortrait ? 'Orientation : portrait' : 'Orientation : paysage'}
    >
      <span
        className={`block border-2 border-current rounded-[2px] transition-all duration-200 ${
          isPortrait ? 'w-2.5 h-4' : 'w-4 h-2.5'
        }`}
      />
    </button>
  );
}
