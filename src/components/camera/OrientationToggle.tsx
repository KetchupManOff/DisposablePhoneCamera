import type { Orientation } from '../../types';
import { useI18n } from '../../i18n/useI18n';

interface OrientationToggleProps {
  orientation: Orientation;
  onChange: () => void;
}

/**
 * Bouton rond compact de bascule d'orientation (portrait / paysage).
 * Affiche un rectangle vertical ou horizontal selon le mode actif.
 */
export function OrientationToggle({ orientation, onChange }: OrientationToggleProps) {
  const { t } = useI18n();
  const isPortrait = orientation === 'portrait';

  return (
    <button
      onClick={onChange}
      className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-vintage-border/50 flex items-center justify-center text-vintage-text hover:border-vintage-accent/60 transition-colors"
      aria-label={isPortrait ? t('orientation.toLandscape') : t('orientation.toPortrait')}
      title={isPortrait ? t('orientation.portrait') : t('orientation.landscape')}
    >
      <span
        className={`block border-2 border-current rounded-[2px] transition-all duration-200 ${
          isPortrait ? 'w-2.5 h-4' : 'w-4 h-2.5'
        }`}
      />
    </button>
  );
}
