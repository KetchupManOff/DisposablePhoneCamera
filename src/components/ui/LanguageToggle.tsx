import { useI18n } from '../../i18n/useI18n';
import type { Lang } from '../../i18n/translations';

const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
];

/**
 * Sélecteur de langue FR / EN, affiché dans le menu principal.
 */
export function LanguageToggle() {
  const { language, setLanguage } = useI18n();

  return (
    <div
      role="group"
      aria-label="Langue / Language"
      className="flex items-center gap-0.5 rounded-full bg-vintage-surface/60 border border-vintage-border/50 p-0.5 shrink-0"
    >
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          aria-pressed={language === code}
          className={`px-2.5 py-1 rounded-full text-xs font-mono transition-all ${
            language === code
              ? 'bg-vintage-accent text-black'
              : 'text-vintage-muted hover:text-vintage-text'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}