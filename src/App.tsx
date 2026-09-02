import { useState, useCallback, useEffect } from 'react';
import { Viewfinder } from './components/camera/Viewfinder';
import { DevelopmentTimer } from './components/roll/DevelopmentTimer';
import { LockedGallery } from './components/roll/LockedGallery';
import { ProjectList } from './components/project/ProjectList';
import { CreateProject } from './components/project/CreateProject';
import { WelcomeGuide } from './components/ui/WelcomeGuide';
import { Toast } from './components/ui/Toast';
import { useStore } from './store/useStore';
import { useHydrateStore } from './hooks/useHydrateStore';
import { useI18n } from './i18n/useI18n';
import { getCamera } from './lib/cameras';
import { applyTheme, getTheme, applyDefaultTheme } from './lib/themes';

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
  const currentProject = useStore((s) => s.currentProject());

  // Appliquer le thème UI quand le projet change
  useEffect(() => {
    if (currentProject?.mode === 'simple' && currentProject.cameraId) {
      const camera = getCamera(currentProject.cameraId);
      if (camera) {
        applyTheme(getTheme(camera.themeId));
        return;
      }
    }
    // Mode control ou pas de projet : thème par défaut
    applyDefaultTheme();
  }, [currentProject?.cameraId, currentProject?.mode]);

  const [screen, setScreen] = useState<Screen>(
    projects.length === 0 ? Screen.Projects : Screen.Camera
  );
  const [toast, setToast] = useState({ visible: false, message: '' });
  const showToast = useCallback((message: string) => { setToast({ visible: true, message }); }, []);
  const dismissToast = useCallback(() => { setToast((prev) => ({ ...prev, visible: false })); }, []);
  const needsProject = currentProjectId === null && screen !== Screen.CreateProject;

  return (
    <div className="h-full w-full relative bg-vintage-bg overflow-hidden">
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
        <WelcomeGuide onClose={() => setScreen(Screen.Camera)} />
      )}

      <Toast message={toast.message} visible={toast.visible} onDismiss={dismissToast} />
    </div>
  );
}