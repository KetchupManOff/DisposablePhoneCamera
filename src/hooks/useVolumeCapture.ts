import { useEffect, useRef } from 'react';

/**
 * Permet de déclencher la prise de photo avec les boutons de volume du
 * téléphone (via l'API Media Session : pistes précédente/suivante).
 *
 * Note : les boutons physiques de volume ne peuvent PAS être capturés
 * directement par une page web. Le hack le plus standard et compatible
 * consiste à déclarer le média comme "en cours de lecture" et à écouter
 * les "actions média" — sur Android (PWA installée) les boutons de volume
 * déclenchent alors ces actions. Sur iOS Safari, WebKit force toujours le
 * contrôle matériel du volume, donc la capture via boutons y est limitée.
 */
export function useVolumeCapture(onCapture: () => void): void {
  const onCaptureRef = useRef(onCapture);
  onCaptureRef.current = onCapture;

  useEffect(() => {
    const ms =
      typeof navigator !== 'undefined' && 'mediaSession' in navigator
        ? navigator.mediaSession
        : null;
    if (!ms) return;

    const fire = () => {
      try {
        onCaptureRef.current();
      } catch (err) {
        console.error('[volume capture]', err);
      }
    };

    // Le Media Session ne transmet ses commandes qu'une fois "l'audio en
    // lecture" simulé via la métadonnée (et idéalement positionState).
    try {
      ms.metadata = new MediaMetadata({
        title: 'Focus',
        artist: 'DispoCam',
      });
    } catch {
      // ignore
    }
    try {
      ms.setActionHandler('previoustrack', fire);
      ms.setActionHandler('nexttrack', fire);
    } catch (err) {
      console.warn('[volume capture] Media Session non supporté:', err);
    }

    return () => {
      try {
        ms.setActionHandler('previoustrack', null);
      } catch {
        /*ignore*/
      }
      try {
        ms.setActionHandler('nexttrack', null);
      } catch {
        /*ignore*/
      }
    };
  }, []);
}