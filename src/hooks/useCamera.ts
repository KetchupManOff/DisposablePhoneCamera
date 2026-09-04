import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { translate } from '../i18n/translations';

type FacingMode = 'user' | 'environment';

interface UseCameraReturn {
  /** Référence à attacher sur l'élément <video> */
  videoRef: React.RefObject<HTMLVideoElement>;
  /** Le flux media actif (pour arrêter proprement) */
  stream: MediaStream | null;
  /** Erreur éventuelle (permission refusée, etc.) */
  error: string | null;
  /** État du chargement de la caméra */
  isLoading: boolean;
  /** Caméra prête ? */
  isReady: boolean;
  /** Appareils disponibles */
  devices: MediaDeviceInfo[];
  /**
   * 2026-09-03 — Selfie mode removed.
   * Toujours 'environment' (caméra arrière).
   * switchCamera, isBackCamera, facingMode supprimés de l'API publique.
   */
  /** Reprendre le flux (après une pause/veille) */
  startCamera: () => Promise<void>;
  /** Arrêter le flux proprement */
  stopCamera: () => void;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null!);
  const language = useStore((s) => s.language);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [facingMode, setFacingMode] = useState<FacingMode>('environment');

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsReady(false);
    }
  }, [stream]);

  const startCamera = useCallback(async (facing: FacingMode = 'environment') => {
    setIsLoading(true);
    setError(null);
    setFacingMode(facing);
    stopCamera();

    // Contexte non-sécurisé : pas de caméra possible (iOS/Safari l'exigent)
    if (!window.isSecureContext || typeof navigator.mediaDevices?.getUserMedia !== 'function') {
      setError(translate(language, 'cameraError.secureContext'));
      setIsLoading(false);
      setIsReady(false);
      return;
    }

    try {
      // iOS Safari ignore parfois l'indice `facingMode` seul et retourne la mauvaise
      // caméra. On force la caméra demandée avec `exact`, avec repli `ideal` pour les
      // navigateurs qui refusent `exact` (OverconstrainedError).
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: facing },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch (exactErr) {
        if (exactErr instanceof DOMException && exactErr.name === 'OverconstrainedError') {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: facing,
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
            audio: false,
          });
        } else {
          throw exactErr;
        }
      }

      setStream(mediaStream);

      // Lister les devices (labels disponibles car permission déjà accordée).
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((d) => d.kind === 'videoinput');
      setDevices(videoDevices);

      // 2026-09-03 — `track.getSettings().facingMode` est peu fiable sur iOS Safari

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        // `play()` peut être interrompu (AbortError) si un autre flux est chargé
        // (StrictMode en dev, bascule de caméra). Ce n'est pas une vraie erreur.
        try {
          await videoRef.current.play();
        } catch (playErr) {
          const isAbort = playErr instanceof DOMException && playErr.name === 'AbortError';
          if (!isAbort) throw playErr;
        }
        setIsReady(true);
      }

    } catch (err: unknown) {
      const message =
        err instanceof DOMException
          ? err.name === 'NotAllowedError'
            ? translate(language, 'cameraError.permission')
            : err.name === 'NotFoundError'
              ? translate(language, 'cameraError.noDevice')
              : err.name === 'OverconstrainedError'
                ? translate(language, 'cameraError.constraints')
                : err.message
          : err instanceof Error
            ? err.message
            : translate(language, 'cameraError.unknown');
      setError(message);
      setIsReady(false);
    } finally {
      setIsLoading(false);
    }
  }, [stopCamera, language]);

  // 2026-09-03 — Selfie mode removed: switchCamera supprimé.
  // Démarrage automatique
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    videoRef,
    stream,
    error,
    isLoading,
    isReady,
    devices,
    startCamera,
    stopCamera,
  };
}