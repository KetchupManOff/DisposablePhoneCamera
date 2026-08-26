import { useState, useCallback } from 'react';
import { Viewfinder } from './components/camera/Viewfinder';
import { DevelopmentTimer } from './components/roll/DevelopmentTimer';
import { LockedGallery } from './components/roll/LockedGallery';
import { ProjectList } from './components/project/ProjectList';
import { CreateProject } from './components/project/CreateProject';
import { TipButton } from './components/tips/TipButton';
import { Toast } from './components/ui/Toast';
import { useStore } from './store/useStore';
import { useLockTimer } from './hooks/useLockTimer';
import { useHydrateStore } from './hooks/useHydrateStore';

enum Screen {
  Projects = 'projects',
  CreateProject = 'create-project',
  Camera = 'camera',
  Gallery = 'gallery',
  Timer = 'timer',
  About = 'about',
}

export default function App() {
  useHydrateStore();

  const projects = useStore((s) => s.projects);
  const currentProjectId = useStore((s) => s.currentProjectId);
  const [screen, setScreen] = useState<Screen>(
    projects.length === 0 ? Screen.Projects : Screen.Camera
  );
  const [toast, setToast] = useState({ visible: false, message: '' });
  const { isLocked, timeRemaining, takingTimeRemaining, isTakingWindowOver } = useLockTimer();
  const showToast = useCallback((message: string) => { setToast({ visible: true, message }); }, []);
  const dismissToast = useCallback(() => { setToast((prev) => ({ ...prev, visible: false })); }, []);
  const needsProject = currentProjectId === null && screen !== Screen.CreateProject;

  return (
    <div className="h-full w-full relative bg-black overflow-hidden">
      {(screen === Screen.Projects || needsProject) && (
        <ProjectList
          onSelectProject={() => setScreen(Screen.Camera)}
          onCreateNew={() => setScreen(Screen.CreateProject)}
        />
      )}
      {screen === Screen.CreateProject && (
        <CreateProject
          onCreated={() => setScreen(Screen.Camera)}
          onCancel={() => setScreen(projects.length > 0 ? Screen.Projects : Screen.Camera)}
        />
      )}
      {screen === Screen.Camera && currentProjectId !== null && (
        <>
          <Viewfinder
            onOpenRollSelector={() => setScreen(Screen.Projects)}
            onOpenTimerSettings={() => setScreen(Screen.Timer)}
            onOpenGallery={() => setScreen(Screen.Gallery)}
            onOpenAbout={() => setScreen(Screen.About)}
          />

          <div className="absolute top-0 right-0 z-40 p-4 pt-6 flex flex-col items-end gap-1">
            {isTakingWindowOver && !isLocked && (
              <div className="px-3 py-1.5 rounded-full bg-vintage-danger/10 backdrop-blur-sm border border-vintage-danger/30 text-xs font-mono text-red-400">
                ⏰ Temps écoulé
              </div>
            )}
            {isLocked && timeRemaining && (
              <div className="px-3 py-1.5 rounded-full bg-vintage-accent/10 backdrop-blur-sm border border-vintage-accent/30 text-xs font-mono text-vintage-accent">
                🔒 {timeRemaining}
              </div>
            )}
            {takingTimeRemaining && (
              <div className="px-3 py-1.5 rounded-full bg-vintage-surface/40 backdrop-blur-sm border border-vintage-border/30 text-[10px] font-mono text-vintage-muted">
                {takingTimeRemaining}
              </div>
            )}
          </div>

        </>
      )}

      {screen === Screen.Timer && currentProjectId !== null && (
        <DevelopmentTimer isOpen={true} onClose={() => setScreen(Screen.Camera)} />
      )}

      {screen === Screen.Gallery && currentProjectId !== null && (
        <LockedGallery isOpen={true} onClose={() => setScreen(Screen.Camera)} />
      )}

      {screen === Screen.About && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[90%] max-w-sm mx-auto bg-vintage-surface border border-vintage-border/40 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-vintage-border/20">
              <h3 className="font-display text-vintage-text">À propos</h3>
              <button onClick={() => setScreen(Screen.Camera)} className="text-vintage-muted hover:text-vintage-text">✕</button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-4xl text-center">📸</p>
              <h2 className="text-center font-display text-vintage-text text-lg">DispoCam</h2>
              <p className="text-sm text-vintage-muted text-center">
                L'appareil photo jetable vintage dans votre poche.
                Créez plusieurs pellicules avec différents films, prenez vos poses et développez plus tard.
              </p>
              <p className="text-xs text-vintage-muted/60 text-center">
                100% gratuit. Fonctionne hors-ligne. PWA installable.
              </p>
              <div className="flex justify-center pt-2">
                <TipButton />
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast.message} visible={toast.visible} onDismiss={dismissToast} />
    </div>
  );
}