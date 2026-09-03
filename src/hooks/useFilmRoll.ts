import { useCallback } from 'react';
import { db } from '../lib/db';
import { encrypt } from '../lib/crypto';
import { useStore } from '../store/useStore';
import type { CapturedPhoto } from '../types';
import { PROFILES } from '../lib/colorProfiles';
import { getFilmProfile } from '../lib/filmProfiles';
import { applyProfile, applyFilmProfile, addBorderById, captureFrame } from '../lib/imageProcessor';
import { getEffectiveRatio } from '../lib/ratio';
import { getCamera, getCameraFilmProfileId } from '../lib/cameras';

interface UseFilmRollReturn {
  /** Capture une photo depuis le stream vidéo et la stocke */
  capturePhoto: (video: HTMLVideoElement, mirror?: boolean) => Promise<CapturedPhoto | null>;
  /** Nombre de poses restantes */
  remainingPoses: number;
  /** Rouleau plein ? */
  isFull: boolean;
  /** Peut-on encore prendre des photos (deadline non dépassée) ? */
  canTakePhotos: boolean;
}

export function useFilmRoll(): UseFilmRollReturn {
  const project = useStore((s) => s.currentProject());
  const addPhotoToCurrentProject = useStore((s) => s.addPhotoToCurrentProject);
  const triggerFlash = useStore((s) => s.triggerFlash);

  const maxPoses = project?.maxPoses ?? 0;
  const photos = project?.photos ?? [];
  const remainingPoses = Math.max(0, maxPoses - photos.length);
  const isFull = remainingPoses <= 0;

  const takingDeadline = project?.takingDeadline ?? null;
  const canTakePhotos =
    !isFull && (takingDeadline === null || Date.now() < takingDeadline);

  const capturePhoto = useCallback(
    async (video: HTMLVideoElement, mirror = false): Promise<CapturedPhoto | null> => {
      const currentProject = useStore.getState().currentProject();
      if (!currentProject) return null;
      if (!video.videoWidth || !video.videoHeight) return null;

      const currentPhotos = currentProject.photos;
      if (currentPhotos.length >= currentProject.maxPoses) return null;

      // Vérifier la deadline
      if (
        currentProject.takingDeadline &&
        Date.now() >= currentProject.takingDeadline
      ) {
        return null;
      }

      // 1. Capturer le frame vidéo (recadré au ratio configuré, orienté)
      const frameCanvas = captureFrame(
        video,
        getEffectiveRatio(currentProject.aspectRatio, currentProject.orientation ?? 'landscape'),
        mirror,
      );

      // 2. Récupérer ImageData
      const ctx = frameCanvas.getContext('2d')!;
      const imageData = ctx.getImageData(
        0,
        0,
        frameCanvas.width,
        frameCanvas.height,
      );

      // 3. Appliquer le profil film (pipeline hybride ou ancien système)
      //    2026-09-02 — Priorité au filmProfileId (nouveau pipeline),
      //    fallback sur l'ancien colorProfile pour rétrocompatibilité.
      let processedCanvas: HTMLCanvasElement;

      const filmProfileId =
        currentProject.filmProfileId ??
        getCameraFilmProfileId(currentProject.cameraId);

      if (filmProfileId) {
        const filmProfile = getFilmProfile(filmProfileId);
        if (filmProfile) {
          // Pipeline hybride 5 étapes (refs/aboutTheCameras.md)
          processedCanvas = applyFilmProfile(imageData, filmProfile);
        } else {
          // Fallback ancien système
          const legacyProfile = PROFILES[currentProject.colorProfile];
          processedCanvas = applyProfile(imageData, legacyProfile);
        }
      } else {
        // Projet ancien sans filmProfileId → ancien système
        const legacyProfile = PROFILES[currentProject.colorProfile];
        processedCanvas = applyProfile(imageData, legacyProfile);
      }

      // 4. Convertir en dataURL
      const dataUrl = processedCanvas.toDataURL('image/jpeg', 0.85);

      // 4b. 2026-09-02 — Appliquer la bordure (Force_Frame ou choix utilisateur)
      let finalDataUrl = dataUrl;
      const camera = getCamera(currentProject.cameraId);
      const forcedFrame = camera?.Force_Frame;
      const borderId =
        typeof forcedFrame === 'string'
          ? forcedFrame
          : currentProject.borderPresetId ?? null;
      const isLandscape = (currentProject.orientation ?? 'landscape') === 'landscape';
      if (borderId && borderId !== '__none__') {
        finalDataUrl = await addBorderById(dataUrl, borderId, isLandscape);
      }

      // 5. Chiffrer (obfuscation)
      const encrypted = encrypt(finalDataUrl);

      // 6. Construire l'objet photo
      const photo: CapturedPhoto = {
        id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        profile: currentProject.colorProfile,
        timestamp: Date.now(),
        blob: new Blob([encrypted], { type: 'text/plain' }),
      };

      // 7. Persister dans IndexedDB
      await db.photos.put({
        id: photo.id,
        projectId: currentProject.id,
        profile: photo.profile,
        timestamp: photo.timestamp,
        dataUrl: encrypted,
      });

      // 8. Mettre à jour le store
      addPhotoToCurrentProject(photo);
      triggerFlash();

      return photo;
    },
    [addPhotoToCurrentProject, triggerFlash],
  );

  return {
    capturePhoto,
    remainingPoses,
    isFull,
    canTakePhotos,
  };
}