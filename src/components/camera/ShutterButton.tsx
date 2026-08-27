interface ShutterButtonProps {
  onCapture: () => void;
  disabled?: boolean;
  remainingPoses: number;
  /** Faux tant que la molette d'armement n'a pas été tournée. */
  isCranked: boolean;
}

export function ShutterButton({ onCapture, disabled, remainingPoses, isCranked }: ShutterButtonProps) {
  const isEmpty = remainingPoses <= 0;
  const isLocked = isEmpty || !isCranked;
  const isBlocked = disabled || isLocked;

  return (
    <button
      onClick={onCapture}
      disabled={isBlocked}
      className={`
        relative w-16 h-16 rounded-full flex items-center justify-center
        transition-all duration-200 active:scale-95
        ${isLocked
          ? 'bg-vintage-border/40 cursor-not-allowed'
          : 'bg-white/90 shadow-lg shadow-black/40 cursor-pointer hover:bg-white active:bg-white/70'
        }
      `}
      aria-label={
        isEmpty
          ? 'Rouleau vide'
          : !isCranked
            ? 'Armez la molette avant de photographier'
            : 'Prendre une photo'
      }
    >
      {/* Anneau extérieur */}
      <div
        className={`
          absolute inset-0 rounded-full border-[3px]
          ${isLocked ? 'border-vintage-muted/30' : 'border-vintage-accent/40'}
        `}
      />
      {/* Bouton central */}
      <div
        className={`
          w-12 h-12 rounded-full border-2
          transition-colors duration-200
          ${isLocked
            ? 'bg-vintage-border/60 border-vintage-border'
            : 'bg-white border-gray-300'
          }
        `}
      />
      {/* Icône centrale */}
      <span className="absolute text-lg">
        {isEmpty ? '🔒' : !isCranked ? '↻' : '📷'}
      </span>
    </button>
  );
}