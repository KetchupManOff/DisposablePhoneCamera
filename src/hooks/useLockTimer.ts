import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { translate, type Lang } from '../i18n/translations';

interface UseLockTimerReturn {
  /** Temps restant avant développement (formaté) */
  timeRemaining: string | null;
  /** Photos verrouillées (pas encore développées) */
  isLocked: boolean;
  /** Développement terminé */
  isExpired: boolean;
  /** Temps restant avant la fin de la prise de vue */
  takingTimeRemaining: string | null;
  /** La fenêtre de prise de vue est-elle dépassée ? */
  isTakingWindowOver: boolean;
}

/**
 * Calcule les temps restants pour le projet courant.
 */
export function useLockTimer(): UseLockTimerReturn {
  const project = useStore((s) => s.currentProject());
  const unlockCurrentProject = useStore((s) => s.unlockCurrentProject);
  const language = useStore((s) => s.language);

  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [takingTimeRemaining, setTakingTimeRemaining] = useState<string | null>(null);

  useEffect(() => {
    if (!project || !project.unlockAt) {
      setTimeRemaining(null);
      setTakingTimeRemaining(calcTakingTime(language, project?.takingDeadline ?? null));
      return;
    }

    const tick = () => {
      const now = Date.now();

      // Timer de développement
      const devDiff = project.unlockAt! - now;
      if (devDiff <= 0) {
        setTimeRemaining(translate(language, 'lockTimer.developed'));
        if (!project.isUnlocked) {
          unlockCurrentProject();
        }
      } else {
        const hours = Math.floor(devDiff / (1000 * 60 * 60));
        const minutes = Math.floor((devDiff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) {
          setTimeRemaining(translate(language, 'lockTimer.hours', { hours, minutes }));
        } else if (minutes > 0) {
          setTimeRemaining(translate(language, 'lockTimer.minutes', { minutes }));
        } else {
          setTimeRemaining(translate(language, 'lockTimer.lessThan'));
        }
      }

      // Timer de prise de vue
      setTakingTimeRemaining(calcTakingTime(language, project.takingDeadline));
    };

    tick();
    const interval = setInterval(tick, 30000);

    return () => clearInterval(interval);
  }, [project?.unlockAt, project?.takingDeadline, project?.isUnlocked, language, unlockCurrentProject]);

  const isLocked = (project?.unlockAt ?? null) !== null && !(project?.isUnlocked ?? true);
  const isExpired = (project?.unlockAt ?? null) !== null && (project?.isUnlocked ?? false);

  return {
    timeRemaining,
    isLocked,
    isExpired,
    takingTimeRemaining,
    isTakingWindowOver:
      project?.takingDeadline !== null && project?.takingDeadline !== undefined
        ? Date.now() >= project.takingDeadline
        : false,
  };
}

function calcTakingTime(language: Lang, deadline: number | null): string | null {
  if (!deadline) return null;
  const diff = deadline - Date.now();
  if (diff <= 0) return translate(language, 'lockTimer.takingFinished');
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return translate(language, 'lockTimer.takingHours', { hours, minutes });
  if (minutes > 0) return translate(language, 'lockTimer.takingMinutes', { minutes });
  return translate(language, 'lockTimer.takingLessThan');
}