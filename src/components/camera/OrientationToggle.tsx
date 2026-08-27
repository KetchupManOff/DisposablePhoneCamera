import type { Orientation } from '../../types';

interface OrientationToggleProps {
  orientation: Orientation;
  onChange: () => void;
}

/**
 * Bouton rond de bascule d'orientation (portrait / paysage).
 * Remplace l'ancien déclencheur : la prise de vue se fait désormais
 * via les boutons de volume (Media Session).
 */
export function OrientationToggle({ orientation, onChange }: OrientationToggleProps) {
  const isPortrait = orientation === 'portrait';

  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <button
        onClick={onChange}
        className="relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 bg-white/90 shadow-lg shadow-black/40 cursor-pointer hover:bg-white"
        aria-label={isPortrait ? 'Passer en paysage' : 'Passer en portrait'}
        title={isPortrait ? 'Passer en paysage' : 'Passer en portrait'}
      >
        {/* Anneau extérieur */}
        <div className="absolute inset-0 rounded-full border-[3px] border-vintage-accent/40" />
        {/* Bouton central + icône d'orientation */}
        <div className="w-12 h-12 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
          <span
            className={`block border-2 border-gray-700 rounded-[3px] transition-all duration-200 ${
              isPortrait ? 'w-3 h-5' : 'w-5 h-3'
            }`}
          />
        </div>
      </button>

      {/* Libellé d'état */}
      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono whitespace-nowrap pointer-events-none backdrop-blur-sm border text-vintage-accent border-vintage-accent/40 bg-vintage-accent/10">
        {isPortrait ? 'Portrait' : 'Paysage'}
      </span>
    </div>
  );
}
