interface ShutterButtonProps {
  onCapture: () => void;
  disabled?: boolean;
  remainingPoses: number;
}

export function ShutterButton({ onCapture, disabled, remainingPoses }: ShutterButtonProps) {
  const isEmpty = remainingPoses <= 0;

  return (
    <button
      onClick={onCapture}
      disabled={disabled || isEmpty}
      className={`
        relative w-16 h-16 rounded-full flex items-center justify-center
        transition-all duration-200 active:scale-95
        ${isEmpty
          ? 'bg-vintage-border/40 cursor-not-allowed'
          : 'bg-white/90 shadow-lg shadow-black/40 cursor-pointer hover:bg-white active:bg-white/70'
        }
      `}
      aria-label={isEmpty ? 'Rouleau vide' : 'Prendre une photo'}
    >
      {/* Anneau extérieur */}
      <div
        className={`
          absolute inset-0 rounded-full border-[3px]
          ${isEmpty ? 'border-vintage-muted/30' : 'border-vintage-accent/40'}
        `}
      />
      {/* Bouton central */}
      <div
        className={`
          w-12 h-12 rounded-full border-2
          transition-colors duration-200
          ${isEmpty
            ? 'bg-vintage-border/60 border-vintage-border'
            : 'bg-white border-gray-300'
          }
        `}
      />
      {/* Icône centrale */}
      <span className="absolute text-lg">
        {isEmpty ? '🔒' : '📷'}
      </span>
    </button>
  );
}