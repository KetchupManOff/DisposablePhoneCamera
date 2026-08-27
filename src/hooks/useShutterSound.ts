import { useCallback, useEffect, useRef } from 'react';

// Le fichier est servi depuis `public/`, donc accessible sous l'URL de base
// de l'app (`/camera/` en production, `/` en dev).
const SHUTTER_SOUND_URL = `${import.meta.env.BASE_URL}sounds/ShutterSound.mp3`;

/**
 * Joue le son d'obturateur quand l'utilisateur prend une photo.
 *
 * - Un seul élément <audio> réutilisé : `currentTime` est remis à 0 à chaque
 *   tir pour permettre des prises rapprochées.
 * - Préchargé au montage pour éviter la latence au premier déclenchement.
 */
export function useShutterSound(): () => void {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(SHUTTER_SOUND_URL);
    audio.preload = 'auto';
    audio.volume = 0.9;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  return useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.currentTime = 0;
      // Sur iOS, play() peut être rejeté tant que l'audio n'est pas débloqué
      // par un geste utilisateur. On ignore silencieusement l'échec.
      const promise = audio.play();
      promise?.catch(() => {
        /* ignore */
      });
    } catch {
      /* ignore */
    }
  }, []);
}
