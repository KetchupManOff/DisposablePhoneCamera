import { useState, useEffect, useRef, useCallback } from 'react';

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
  /** Caméra active ('environment' = dos, 'user' = avant) */
  facingMode: 'user' | 'environment';
  /** Vrai si la caméra arrière (dos) est active */
  isBackCamera: boolean;
  /** Basculer entre caméras avant/arrière */
  switchCamera: () => void;
  /** Reprendre le flux (après une pause/veille) */
  startCamera: () => Promise<void>;
  /** Arrêter le flux proprement */
  stopCamera: () => void;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null!);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsReady(false);
    }
  }, [stream]);

  const startCamera = useCallback(async (facing: 'user' | 'environment' = 'environment') => {
    setIsLoading(true);
    setError(null);
    setFacingMode(facing);
    stopCamera();

    // Contexte non-sécurisé : pas de caméra possible (iOS/Safari l'exigent)
    if (!window.isSecureContext || typeof navigator.mediaDevices?.getUserMedia !== 'function') {
      setError(
        'L\'appareil photo nécessite une connexion sécurisée (https). ' +
          'Ouvrez l\'app en https:// depuis votre téléphone (ou en "http://localhost" sur un ordinateur).',
      );
      setIsLoading(false);
      setIsReady(false);
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);

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

      // Lister les devices
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      setDevices(allDevices.filter((d) => d.kind === 'videoinput'));

    } catch (err: unknown) {
      const message =
        err instanceof DOMException
          ? err.name === 'NotAllowedError'
            ? "Permission caméra refusée. Autorisez l'accès dans les paramètres."
            : err.name === 'NotFoundError'
              ? 'Aucune caméra détectée.'
              : err.name === 'OverconstrainedError'
                ? 'Caméra introuvable avec les réglages demandés.'
                : err.message
          : err instanceof Error
            ? err.message
            : 'Erreur inconnue lors de l\'accès à la caméra.';
      setError(message);
      setIsReady(false);
    } finally {
      setIsLoading(false);
    }
  }, [stopCamera]);

  const switchCamera = useCallback(() => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    startCamera(next);
  }, [facingMode, startCamera]);

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
    facingMode,
    isBackCamera: facingMode === 'environment',
    switchCamera,
    startCamera,
    stopCamera,
  };
}