/**
 * useFlash — Contrôle de la torche / flash du device.
 *
 * Utilise `MediaStreamTrack.applyConstraints({ advanced: [{ torch: true/false }] })`
 * pour allumer ou éteindre la LED du flash arrière.
 *
 * Fonctionne sur :
 * - Safari iOS (torch natif)
 * - Chrome Android (torch natif)
 * - Chrome Desktop (pas de torche, mais pas d'erreur)
 *
 * En cas d'absence de torche, `torchAvailable` reste `false` et les appels
 * sont ignorés silencieusement.
 */

import { useCallback, useEffect, useRef } from 'react';

interface UseFlashReturn {
  /** Vrai si le device supporte la torche. */
  torchAvailable: boolean;
  /** Allume ou éteint la torche. */
  setTorch: (on: boolean) => Promise<void>;
}

export function useFlash(stream: MediaStream | null): UseFlashReturn {
  const torchAvailableRef = useRef(false);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);

  // À chaque changement de flux, on vérifie si la torche est disponible.
  useEffect(() => {
    if (!stream) {
      videoTrackRef.current = null;
      torchAvailableRef.current = false;
      return;
    }

    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) {
      torchAvailableRef.current = false;
      return;
    }

    videoTrackRef.current = videoTrack;

    // Vérifier la capacité torche.
    try {
      const capabilities = videoTrack.getCapabilities();
      torchAvailableRef.current = 'torch' in capabilities;
    } catch {
      // getCapabilities() peut échouer sur certains navigateurs.
      // On tente quand même applyConstraints qui réussira ou échouera.
      torchAvailableRef.current = true;
    }
  }, [stream]);

  const setTorch = useCallback(async (on: boolean) => {
    const track = videoTrackRef.current;
    if (!track || !torchAvailableRef.current) return;

    try {
      await track.applyConstraints({
        advanced: [{ torch: on } as MediaTrackConstraintSet],
      });
    } catch {
      // Torch non supportée ou refusée — on ignore silencieusement.
      torchAvailableRef.current = false;
    }
  }, []);

  return {
    get torchAvailable() {
      return torchAvailableRef.current;
    },
    setTorch,
  };
}