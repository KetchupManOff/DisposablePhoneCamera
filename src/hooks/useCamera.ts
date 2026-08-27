import { useState, useEffect, useRef, useCallback } from 'react';

type FacingMode = 'user' | 'environment';

/** Marqueurs (localisés) présents dans le label d'une caméra avant. */
const FRONT_MARKERS = [
  'front', 'user', 'avant', 'frontal', 'delanter', 'frontale', 'vor',
  '前面', '前置', '前摄像',
];

/** Marqueurs (localisés) présents dans le label d'une caméra arrière. */
const BACK_MARKERS = [
  'back', 'rear', 'environment', 'arrière', 'arriere', 'traser', 'trasera',
  'hinter', 'haupt', 'principal', '后面', '背面', '后置', '后摄像',
];

/**
 * Détermine la vraie caméra active en croisant plusieurs signaux.
 * Sur iOS Safari, `getSettings().facingMode` est souvent vide/absent : on
 * s'appuie alors sur le `deviceId` croisé avec `enumerateDevices()`, puis sur le
 * `label` de la piste vidéo, et enfin on retombe sur la caméra demandée.
 */
function detectFacing(
  track: MediaStreamTrack | undefined,
  requested: FacingMode,
  devices: MediaDeviceInfo[],
): FacingMode {
  if (!track) return requested;

  let settings: MediaTrackSettings | undefined;
  try {
    settings = track.getSettings();
  } catch {
    settings = undefined;
  }

  // 1. facingMode renseigné (Chrome/Android, iOS récent)
  const fm = settings?.facingMode;
  if (fm === 'user' || fm === 'environment') return fm;

  const matches = (label: string, markers: string[]): boolean => {
    const l = label.toLowerCase();
    return markers.some((m) => l.includes(m));
  };

  // 2. deviceId croisé avec la liste des devices (labels lisibles après permission)
  const deviceId = settings?.deviceId;
  if (deviceId) {
    const device = devices.find((d) => d.deviceId === deviceId);
    if (device?.label) {
      if (matches(device.label, FRONT_MARKERS)) return 'user';
      if (matches(device.label, BACK_MARKERS)) return 'environment';
    }
  }

  // 3. label de la piste vidéo (fiable sur iOS : « Caméra avant/arrière », etc.)
  if (track.label) {
    if (matches(track.label, FRONT_MARKERS)) return 'user';
    if (matches(track.label, BACK_MARKERS)) return 'environment';
  }

  // 4. on fait confiance à la caméra demandée
  return requested;
}

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
  facingMode: FacingMode;
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

      const videoTrack = mediaStream.getVideoTracks()[0];

      // Lister les devices (labels disponibles car permission déjà accordée).
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((d) => d.kind === 'videoinput');
      setDevices(videoDevices);

      // Détermine la vraie caméra active. Sur iOS Safari, `getSettings().facingMode`
      // est souvent vide : on croise deviceId/label avec enumerateDevices().
      setFacingMode(detectFacing(videoTrack, facing, videoDevices));

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