import { useState } from 'react';
import { useI18n } from '../../i18n/useI18n';
import { LanguageToggle } from './LanguageToggle';
import { TipButton } from '../tips/TipButton';

type Tab = 'philosophy' | 'guide' | 'install';

interface WelcomeGuideProps {
  onClose: () => void;
}

/* ------------------------------------------------------------------ */
/* Philosophy                                                            */
/* ------------------------------------------------------------------ */
function PhilosophySection({ t }: { t: (key: string, p?: Record<string, string | number>) => string }) {
  const items: { emoji: string; key: string }[] = [
    { emoji: '🎞️', key: 'guide.philosophy.limited' },
    { emoji: '⏳', key: 'guide.philosophy.wait' },
    { emoji: '🔒', key: 'guide.philosophy.private' },
    { emoji: '🎉', key: 'guide.philosophy.surprise' },
    { emoji: '📸', key: 'guide.philosophy.vintage' },
  ];

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-5xl mb-3">📸</p>
        <h2 className="font-display text-vintage-text text-xl mb-2">DispoCam</h2>
        <p className="text-sm text-vintage-muted leading-relaxed">
          {t('guide.philosophy.intro')}
        </p>
      </div>
      <div className="space-y-3">
        {items.map(({ emoji, key }) => (
          <div
            key={key}
            className="flex items-start gap-3 p-3 rounded-xl bg-vintage-surface/40 border border-vintage-border/20"
          >
            <span className="text-2xl shrink-0">{emoji}</span>
            <p className="text-sm text-vintage-text/90 leading-relaxed">{t(key)}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-center text-vintage-muted/60 italic">
        {t('guide.philosophy.footer')}
      </p>
    </div>
  );
}
/* ------------------------------------------------------------------ */
/* Usage Guide                                                           */
/* ------------------------------------------------------------------ */
function GuideSection({ t }: { t: (key: string, p?: Record<string, string | number>) => string }) {
  const steps: { emoji: string; titleKey: string; descKey: string }[] = [
    { emoji: '1️⃣', titleKey: 'guide.steps.create.title', descKey: 'guide.steps.create.desc' },
    { emoji: '2️⃣', titleKey: 'guide.steps.settings.title', descKey: 'guide.steps.settings.desc' },
    { emoji: '3️⃣', titleKey: 'guide.steps.shoot.title', descKey: 'guide.steps.shoot.desc' },
    { emoji: '4️⃣', titleKey: 'guide.steps.develop.title', descKey: 'guide.steps.develop.desc' },
    { emoji: '5️⃣', titleKey: 'guide.steps.discover.title', descKey: 'guide.steps.discover.desc' },
  ];

  return (
    <div className="space-y-5">
      <p className="text-sm text-vintage-muted text-center leading-relaxed">
        {t('guide.steps.intro')}
      </p>
      <div className="space-y-4">
        {steps.map(({ emoji, titleKey, descKey }) => (
          <div
            key={titleKey}
            className="p-4 rounded-xl bg-vintage-surface/40 border border-vintage-border/20"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">{emoji}</span>
              <div>
                <h3 className="font-display text-vintage-text text-sm mb-1">{t(titleKey)}</h3>
                <p className="text-xs text-vintage-muted leading-relaxed">{t(descKey)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 rounded-xl border border-vintage-accent/30 bg-vintage-accent/5">
        <p className="text-xs text-vintage-accent font-mono">
          <span className="mr-1">💡</span>
          {t('guide.steps.tip')}
        </p>
      </div>
    </div>
  );
}
/* ------------------------------------------------------------------ */
/* PWA Installation                                                    */
/* ------------------------------------------------------------------ */
function InstallSection({ t }: { t: (key: string, p?: Record<string, string | number>) => string }) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-vintage-muted text-center leading-relaxed">
        {t('guide.install.intro')}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {(['offline', 'fullscreen', 'app'] as const).map((key) => (
          <div
            key={key}
            className="flex flex-col items-center gap-1 p-3 rounded-xl bg-vintage-surface/40 border border-vintage-border/20 text-center"
          >
            <span className="text-xl">{t(`guide.install.benefits.${key}.icon`)}</span>
            <span className="text-xs text-vintage-text font-mono">
              {t(`guide.install.benefits.${key}.label`)}
            </span>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-vintage-border/30 bg-vintage-surface/40 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-vintage-border/20 bg-vintage-surface/60">
          <span className="text-lg">🍎</span>
          <h3 className="font-display text-vintage-text text-sm">{t('guide.install.iphone.title')}</h3>
        </div>
        <div className="p-4 space-y-3">
          {([1, 2, 3, 4] as const).map((n) => (
            <div key={n} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-vintage-accent/20 border border-vintage-accent/30 flex items-center justify-center text-xs font-mono text-vintage-accent">
                {n}
              </span>
              <p
                className="text-xs text-vintage-text/80 leading-relaxed pt-0.5"
                dangerouslySetInnerHTML={{ __html: t(`guide.install.iphone.step${n}`) }}
              />
            </div>
          ))}
          <div className="mt-3 p-3 rounded-lg bg-vintage-surface/60 border border-vintage-border/20">
            <p className="text-xs text-center text-vintage-muted font-mono">
              {t('guide.install.iphone.safariNote')}
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-vintage-border/30 bg-vintage-surface/40 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-vintage-border/20 bg-vintage-surface/60">
          <span className="text-lg">🤖</span>
          <h3 className="font-display text-vintage-text text-sm">{t('guide.install.android.title')}</h3>
        </div>
        <div className="p-4 space-y-3">
          {([1, 2, 3] as const).map((n) => (
            <div key={n} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-vintage-accent/20 border border-vintage-accent/30 flex items-center justify-center text-xs font-mono text-vintage-accent">
                {n}
              </span>
              <p
                className="text-xs text-vintage-text/80 leading-relaxed pt-0.5"
                dangerouslySetInnerHTML={{ __html: t(`guide.install.android.step${n}`) }}
              />
            </div>
          ))}
          <div className="mt-3 p-3 rounded-lg bg-vintage-surface/60 border border-vintage-border/20">
            <p className="text-xs text-center text-vintage-muted font-mono">
              {t('guide.install.android.chromeNote')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export function WelcomeGuide({ onClose }: WelcomeGuideProps) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>('philosophy');

  const tabs: { key: Tab; icon: string }[] = [
    { key: 'philosophy', icon: '💡' },
    { key: 'guide', icon: '📖' },
    { key: 'install', icon: '📲' },
  ];

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-vintage-bg">
      <div className="flex items-center justify-between p-4 pt-safe-6 border-b border-vintage-border/30 gap-2 shrink-0">
        <h2 className="text-lg font-display text-vintage-text">{t('guide.title')}</h2>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <TipButton />
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-vintage-border/40 text-vintage-muted hover:text-vintage-text hover:border-vintage-accent/50 transition-all text-sm"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="flex border-b border-vintage-border/20 shrink-0">
        {tabs.map(({ key, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-3 text-sm font-mono transition-all border-b-2 ${
              tab === key
                ? 'border-vintage-accent text-vintage-accent bg-vintage-accent/5'
                : 'border-transparent text-vintage-muted hover:text-vintage-text'
            }`}
          >
            {icon} {t(`guide.tab.${key}`)}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
        {tab === 'philosophy' && <PhilosophySection t={t} />}
        {tab === 'guide' && <GuideSection t={t} />}
        {tab === 'install' && <InstallSection t={t} />}
      </div>
      <div className="h-[env(safe-area-inset-bottom,0px)] shrink-0" />
    </div>
  );
}