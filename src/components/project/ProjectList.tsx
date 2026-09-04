import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { db } from '../../lib/db';
import { PROFILES } from '../../lib/colorProfiles';
import { getCamera } from '../../lib/cameras';
import { useI18n } from '../../i18n/useI18n';
import { LanguageToggle } from '../ui/LanguageToggle';
import { WelcomeGuide } from '../ui/WelcomeGuide';
import { TipButton } from '../tips/TipButton';
import type { TFunction } from '../../i18n/translations';

interface ProjectListProps {
  onSelectProject: () => void;
  onCreateNew: () => void;
}

function formatTimeRemaining(t: TFunction, deadline: number | null): string {
  if (!deadline) return t('projects.timeRemaining.noLimit');
  const diff = deadline - Date.now();
  if (diff <= 0) return t('projects.timeRemaining.finished');
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return t('projects.timeRemaining.hours', { hours, minutes });
  if (minutes > 0) return t('projects.timeRemaining.minutes', { minutes });
  return t('projects.timeRemaining.lessThan');
}

function formatDevTime(t: TFunction, unlockAt: number | null, isUnlocked: boolean): string {
  if (isUnlocked || !unlockAt) return t('projects.devTime.developed');
  const diff = unlockAt - Date.now();
  if (diff <= 0) return t('projects.devTime.ready');
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return t('projects.devTime.hours', { hours, minutes });
  if (minutes > 0) return t('projects.devTime.minutes', { minutes });
  return t('projects.devTime.soon');
}

export function ProjectList({ onSelectProject, onCreateNew }: ProjectListProps) {
  const projects = useStore((s) => s.projects);
  const currentProjectId = useStore((s) => s.currentProjectId);
  const setCurrentProjectId = useStore((s) => s.setCurrentProjectId);
  const removeProject = useStore((s) => s.removeProject);
  const { t } = useI18n();
  const [showInfo, setShowInfo] = useState(false);

  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => forceUpdate((n) => n + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-vintage-bg">
      <div className="flex items-center justify-between p-4 pt-safe-6 border-b border-vintage-border/30 gap-2">
        <h2 className="text-lg font-display text-vintage-text">{t('projects.title')}</h2>
        <div className="flex items-center gap-2 shrink-0">
          <LanguageToggle />
          <button
            onClick={() => setShowInfo(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-vintage-border/40 text-vintage-muted hover:text-vintage-text hover:border-vintage-accent/50 transition-all text-sm"
            title={t('projects.info')}
          >
            ℹ️
          </button>
          <button
            onClick={onCreateNew}
            className="px-4 py-2 rounded-full bg-vintage-accent text-black font-mono text-sm hover:bg-vintage-accent/90 transition-all"
          >
            {t('projects.new')}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <p className="text-5xl mb-4">🎞️</p>
            <p className="text-vintage-muted text-sm mb-2">{t('projects.empty')}</p>
            <p className="text-vintage-muted/60 text-xs mb-6">{t('projects.emptyHint')}</p>
            <button
              onClick={onCreateNew}
              className="px-6 py-3 rounded-xl bg-vintage-accent text-black font-display hover:bg-vintage-accent/90 transition-all"
            >
              {t('projects.create')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => {
              const profile = PROFILES[project.colorProfile];
              const camera = getCamera(project.cameraId);
              const isActive = project.id === currentProjectId;
              const photosCount = project.photos.length;

              return (
                <div
                  key={project.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isActive
                      ? 'border-vintage-accent bg-vintage-accent/5'
                      : 'border-vintage-border/30 bg-vintage-surface/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-display text-vintage-text text-sm">{project.name}</h3>
                      <p className="text-xs text-vintage-muted font-mono">
                        {project.mode === 'simple' && camera
                          ? `${camera.emoji} ${camera.label} · ${project.aspectRatio}`
                          : `${profile.emoji} ${profile.label} · ${project.aspectRatio}`}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-vintage-muted">
                      {photosCount}/{project.maxPoses}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-vintage-muted/70">
                      {formatDevTime(t, project.unlockAt, project.isUnlocked)}
                    </span>
                    {project.takingDeadline && !project.isUnlocked && (
                      <span className="text-vintage-accent/70">
                        📷 {formatTimeRemaining(t, project.takingDeadline)}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3">
                    {!isActive && (
                      <button
                        onClick={() => {
                          setCurrentProjectId(project.id);
                          onSelectProject();
                        }}
                        className="flex-1 py-2 rounded-lg border border-vintage-border/40 text-xs font-mono text-vintage-text hover:border-vintage-accent/50 hover:bg-vintage-accent/10 transition-all"
                      >
                        {t('projects.open')}
                      </button>
                    )}
                    {isActive && (
                      <button
                        onClick={onSelectProject}
                        className="flex-1 py-2 rounded-lg bg-vintage-accent/20 border border-vintage-accent/40 text-xs font-mono text-vintage-accent"
                      >
                        {t('projects.active')}
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        // Supprimer les photos du projet
                        const photos = await db.photos.where('projectId').equals(project.id).toArray();
                        for (const p of photos) {
                          await db.photos.delete(p.id);
                        }
                        await db.projects.delete(project.id);
                        removeProject(project.id);
                      }}
                      className="py-2 px-3 rounded-lg border border-red-500/20 text-xs font-mono text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="flex justify-center py-3 border-t border-vintage-border/20">
        <TipButton />
      </div>
      {showInfo && <WelcomeGuide onClose={() => setShowInfo(false)} />}
    </div>
  );
}
