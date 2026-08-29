import { useState, useCallback, useEffect } from 'react';
import { Viewfinder } from './components/camera/Viewfinder';
import { DevelopmentTimer } from './components/roll/DevelopmentTimer';
import { LockedGallery } from './components/roll/LockedGallery';
import { ProjectList } from './components/project/ProjectList';
import { CreateProject } from './components/project/CreateProject';
import { TipButton } from './components/tips/TipButton';
import { Toast } from './components/ui/Toast';
import { LanguageToggle } from './components/ui/LanguageToggle';
import { useStore } from './store/useStore';
import { useHydrateStore } from './hooks/useHydrateStore';
import { useI18n } from './i18n/useI18n';

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

  const { language, t } = useI18n();

  // Langue du document (attribut lang + titre de l'onglet)
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t('meta.title');
  }, [language, t]);

  const projects = useStore((s) => s.projects);
  const currentProjectId = useStore((s) => s.currentProjectId);
  const [screen, setScreen] = useState<Screen>(
    projects.length === 0 ? Screen.Projects : Screen.Camera
  );
  const [toast, setToast] = useState({ visible: false, message: '' });
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
        <Viewfinder
          onOpenRollSelector={() => setScreen(Screen.Projects)}
          onOpenTimerSettings={() => setScreen(Screen.Timer)}
          onOpenGallery={() => setScreen(Screen.Gallery)}
          onOpenAbout={() => setScreen(Screen.About)}
        />
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
              <h3 className="font-display text-vintage-text">{t('app.about')}</h3>
              <div className="flex items-center gap-2">
                <LanguageToggle />
                <button onClick={() => setScreen(Screen.Camera)} className="text-vintage-muted hover:text-vintage-text">✕</button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-4xl text-center">📸</p>
              <h2 className="text-center font-display text-vintage-text text-lg">DispoCam</h2>
              <p className="text-sm text-vintage-muted text-center">
                {t('app.aboutTagline')}
              </p>
              <p className="text-xs text-vintage-muted/60 text-center">
                {t('app.aboutFree')}
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