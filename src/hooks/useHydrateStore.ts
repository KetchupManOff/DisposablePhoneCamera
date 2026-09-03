import { useEffect } from 'react';
import { db } from '../lib/db';
import { useStore } from '../store/useStore';
import type { Project, CapturedPhoto, AspectRatio, Orientation, ColorProfile, ProjectMode } from '../types';
import type { Lang } from '../i18n/translations';

/**
 * Hydrate le store Zustand depuis IndexedDB au démarrage de l'application.
 */
export function useHydrateStore(): void {
  const setProjects = useStore((s) => s.setProjects);
  const setCurrentProjectId = useStore((s) => s.setCurrentProjectId);
  const setCurrentProjectPhotos = useStore((s) => s.setCurrentProjectPhotos);
  const setLanguage = useStore((s) => s.setLanguage);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      try {
        // 1. Charger les projets
        const storedProjects = await db.projects.toArray();

        // 2. Charger toutes les photos groupées par projet
        const storedPhotos = await db.photos.toArray();
        const photosByProject: Record<string, CapturedPhoto[]> = {};

        for (const sp of storedPhotos) {
          const photo: CapturedPhoto = {
            id: sp.id,
            profile: sp.profile as ColorProfile,
            timestamp: sp.timestamp,
            blob: new Blob([sp.dataUrl], { type: 'text/plain' }),
            thumbnail: sp.thumbnail,
          };
          if (!photosByProject[sp.projectId]) {
            photosByProject[sp.projectId] = [];
          }
          photosByProject[sp.projectId].push(photo);
        }

        // 3. Reconstruire les projets avec leurs photos
        const projects: Project[] = storedProjects.map((sp) => ({
          id: sp.id,
          name: sp.name,
          // Rétrocompatibilité : anciens projets = mode "control" (réglages libres)
          mode: (sp.mode as ProjectMode) || 'control',
          cameraId: sp.cameraId ?? null,
          colorProfile: sp.colorProfile as ColorProfile,
          aspectRatio: sp.aspectRatio as AspectRatio,
          orientation: (sp.orientation as Orientation) || 'landscape',
          maxPoses: sp.maxPoses,
          photos: photosByProject[sp.id] || [],
          takingDeadline: sp.takingDeadline,
          unlockAt: sp.unlockAt,
          createdAt: sp.createdAt,
          isUnlocked: sp.isUnlocked,
          // 2026-09-02 — Pipeline hybride (optionnels)
          filmProfileId: sp.filmProfileId ?? null,
          borderPresetId: sp.borderPresetId ?? null,
        }));

        if (!cancelled) {
          setProjects(projects);

          // Récupérer le dernier projet actif depuis les settings
          const settingsArr = await db.settings.toArray();
          const settingsMap = Object.fromEntries(
            settingsArr.map((s) => [s.key, s.value]),
          );
          const lastProjectId = settingsMap.currentProjectId as string | undefined;

          if (lastProjectId && projects.some((p) => p.id === lastProjectId)) {
            setCurrentProjectId(lastProjectId);
          } else if (projects.length > 0) {
            setCurrentProjectId(projects[0].id);
          }

          // Restaurer la langue choisie (défaut : français)
          const storedLang = settingsMap.language as Lang | undefined;
          if (storedLang === 'fr' || storedLang === 'en') {
            setLanguage(storedLang);
          }
        }
      } catch (err) {
        console.error('[hydrate] Impossible de charger les données:', err);
      }
    };

    hydrate();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}