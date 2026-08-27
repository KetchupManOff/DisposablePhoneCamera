import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { db } from '../../lib/db';
import { PROFILES } from '../../lib/colorProfiles';
import { getCamera } from '../../lib/cameras';

interface ProjectListProps {
  onSelectProject: () => void;
  onCreateNew: () => void;
}

function formatTimeRemaining(deadline: number | null): string {
  if (!deadline) return 'Pas de limite';
  const diff = deadline - Date.now();
  if (diff <= 0) return 'Terminé';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m restantes`;
  if (minutes > 0) return `${minutes} min restantes`;
  return "< 1 min";
}

function formatDevTime(unlockAt: number | null, isUnlocked: boolean): string {
  if (isUnlocked || !unlockAt) return 'Développé ✓';
  const diff = unlockAt - Date.now();
  if (diff <= 0) return 'Prêt ! 🎉';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `Développement dans ${hours}h ${minutes}m`;
  if (minutes > 0) return `Développement dans ${minutes}m`;
  return 'Bientôt...';
}

export function ProjectList({ onSelectProject, onCreateNew }: ProjectListProps) {
  const projects = useStore((s) => s.projects);
  const currentProjectId = useStore((s) => s.currentProjectId);
  const setCurrentProjectId = useStore((s) => s.setCurrentProjectId);
  const removeProject = useStore((s) => s.removeProject);

  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => forceUpdate((n) => n + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-vintage-bg">
      <div className="flex items-center justify-between p-4 pt-safe-6 border-b border-vintage-border/30">
        <h2 className="text-lg font-display text-vintage-text">Mes pellicules</h2>
        <button
          onClick={onCreateNew}
          className="px-4 py-2 rounded-full bg-vintage-accent text-black font-mono text-sm hover:bg-vintage-accent/90 transition-all"
        >
          + Nouvelle
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <p className="text-5xl mb-4">🎞️</p>
            <p className="text-vintage-muted text-sm mb-2">Aucune pellicule pour le moment.</p>
            <p className="text-vintage-muted/60 text-xs mb-6">Créez votre première pellicule pour commencer !</p>
            <button
              onClick={onCreateNew}
              className="px-6 py-3 rounded-xl bg-vintage-accent text-black font-display hover:bg-vintage-accent/90 transition-all"
            >
              📸 Créer une pellicule
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
                      {formatDevTime(project.unlockAt, project.isUnlocked)}
                    </span>
                    {project.takingDeadline && !project.isUnlocked && (
                      <span className="text-vintage-accent/70">
                        📷 {formatTimeRemaining(project.takingDeadline)}
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
                        Ouvrir
                      </button>
                    )}
                    {isActive && (
                      <button
                        onClick={onSelectProject}
                        className="flex-1 py-2 rounded-lg bg-vintage-accent/20 border border-vintage-accent/40 text-xs font-mono text-vintage-accent"
                      >
                        Actif ✓
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
    </div>
  );
}
