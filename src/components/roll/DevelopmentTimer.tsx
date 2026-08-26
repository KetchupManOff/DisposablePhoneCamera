import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { useLockTimer } from '../../hooks/useLockTimer';

interface DevelopmentTimerProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_OPTIONS = [
  { label: '1 heure', hours: 1 },
  { label: '3 heures', hours: 3 },
  { label: '6 heures', hours: 6 },
  { label: 'Ce soir 20h', targetHour: 20 },
  { label: 'Demain 9h', targetHour: 9, nextDay: true },
  { label: 'Pas de verrou', hours: 0 },
];

function getTargetTimestamp(targetHour: number, nextDay = false): number {
  const d = new Date();
  if (nextDay) d.setDate(d.getDate() + 1);
  d.setHours(targetHour, 0, 0, 0);
  if (!nextDay && d.getTime() <= Date.now()) {
    d.setDate(d.getDate() + 1);
  }
  return d.getTime();
}

export function DevelopmentTimer({ isOpen, onClose }: DevelopmentTimerProps) {
  const currentProject = useStore((s) => s.currentProject());
  const updateCurrentProjectTimer = useStore((s) => s.updateCurrentProjectTimer);
  const { timeRemaining, isLocked, takingTimeRemaining } = useLockTimer();
  const [customHours, setCustomHours] = useState('3');
  const [customMinutes, setCustomMinutes] = useState('0');

  if (!isOpen) return null;

  const handleQuickOption = (option: (typeof QUICK_OPTIONS)[number]) => {
    if (!currentProject) return;
    if (option.hours === 0) {
      updateCurrentProjectTimer(currentProject.takingDeadline, null);
      onClose();
      return;
    }
    if ('targetHour' in option && option.targetHour) {
      const ts = getTargetTimestamp(option.targetHour, option.nextDay);
      updateCurrentProjectTimer(currentProject.takingDeadline, ts);
      onClose();
      return;
    }
    if (option.hours) {
      updateCurrentProjectTimer(currentProject.takingDeadline, Date.now() + option.hours * 3600 * 1000);
      onClose();
    }
  };

  const handleCustomDelay = () => {
    const h = parseInt(customHours, 10) || 0;
    const m = parseInt(customMinutes, 10) || 0;
    const totalMs = (h * 3600 + m * 60) * 1000;
    if (totalMs <= 0 || !currentProject) return;
    updateCurrentProjectTimer(currentProject.takingDeadline, Date.now() + totalMs);
    onClose();
  };

  const handleCancelLock = () => {
    if (!currentProject) return;
    updateCurrentProjectTimer(currentProject.takingDeadline, null);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-vintage-bg/95 backdrop-blur-md">
      <div className="flex items-center justify-between p-4 pt-6 border-b border-vintage-border/30">
        <h2 className="text-lg font-display text-vintage-text">Développement</h2>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-vintage-surface/50 border border-vintage-border/50 flex items-center justify-center text-vintage-muted hover:text-vintage-text"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {currentProject && (
          <div className="p-3 rounded-xl bg-vintage-surface/30 border border-vintage-border/20">
            <p className="text-xs text-vintage-muted font-mono">Pellicule active</p>
            <p className="text-vintage-text font-display text-sm">{currentProject.name}</p>
          </div>
        )}

        {isLocked && timeRemaining && (
          <div className="p-4 rounded-xl bg-vintage-accent/10 border border-vintage-accent/30">
            <p className="text-xs text-vintage-muted font-mono mb-1">Temps restant avant développement</p>
            <p className="text-xl font-display text-vintage-accent">{timeRemaining}</p>
            <button
              onClick={handleCancelLock}
              className="mt-3 text-xs text-red-400 underline hover:text-red-300"
            >
              Annuler le verrouillage
            </button>
          </div>
        )}

        {takingTimeRemaining && (
          <div className="p-4 rounded-xl bg-vintage-surface/30 border border-vintage-border/30">
            <p className="text-xs text-vintage-muted font-mono mb-1">Fenêtre de prise de vue</p>
            <p className="text-sm font-mono text-vintage-text">{takingTimeRemaining}</p>
          </div>
        )}

        <div>
          <p className="text-xs font-mono text-vintage-muted mb-3 uppercase tracking-wider">
            Durées rapides
          </p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => handleQuickOption(opt)}
                className="p-3 rounded-xl border border-vintage-border/40 bg-vintage-surface/20 text-sm text-vintage-text hover:border-vintage-accent/50 hover:bg-vintage-accent/10 transition-all font-mono"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-mono text-vintage-muted mb-3 uppercase tracking-wider">
            Délai personnalisé
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0" max="72"
              value={customHours}
              onChange={(e) => setCustomHours(e.target.value)}
              className="flex-1 p-3 rounded-xl bg-vintage-surface/50 border border-vintage-border/40 text-center text-vintage-text font-mono text-lg focus:border-vintage-accent outline-none"
            />
            <span className="text-vintage-muted text-sm font-mono">h</span>
            <input
              type="number"
              min="0" max="59"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              className="flex-1 p-3 rounded-xl bg-vintage-surface/50 border border-vintage-border/40 text-center text-vintage-text font-mono text-lg focus:border-vintage-accent outline-none"
            />
            <span className="text-vintage-muted text-sm font-mono">m</span>
            <button
              onClick={handleCustomDelay}
              className="p-3 rounded-xl bg-vintage-accent/20 border border-vintage-accent/40 text-vintage-accent font-mono text-sm hover:bg-vintage-accent/30"
            >
              OK
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-vintage-border/30">
        <p className="text-xs text-vintage-muted text-center font-mono">
          Les photos resteront masquées jusqu'au développement.
        </p>
      </div>
    </div>
  );
}