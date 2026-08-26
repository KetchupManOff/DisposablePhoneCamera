import { useState, useCallback, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { useCamera } from '../../hooks/useCamera';
import { useFilmRoll } from '../../hooks/useFilmRoll';
import { ShutterButton } from './ShutterButton';
import { FilmCounter } from './FilmCounter';
import { useColorProfile } from '../../hooks/useColorProfile';
import { useVolumeCapture } from '../../hooks/useVolumeCapture';

interface ViewfinderProps {
  onOpenRollSelector: () => void;
  onOpenTimerSettings: () => void;
}

export function Viewfinder({
  onOpenRollSelector,
  onOpenTimerSettings,
}: ViewfinderProps) {
  const { videoRef, error, isLoading, isReady, switchCamera } = useCamera();
  const { capturePhoto, remainingPoses, isFull, canTakePhotos } = useFilmRoll();
  const currentProject = useStore((s) => s.currentProject());
  const { currentProfile } = useColorProfile();
  const [flash, setFlash] = useState(false);

  const handleCapture = useCallback(async () => {
    if (!videoRef.current || !canTakePhotos) return;
    if (!isReady) return;

    // Flash de l'obturateur
    setFlash(true);
    setTimeout(() => setFlash(false), 350);

    await capturePhoto(videoRef.current);
  }, [videoRef, canTakePhotos, capturePhoto, isReady]);

  // Prise de photo via boutons de volume (Media Session)
  useVolumeCapture(() => {
    void handleCapture();
  });

  // Empêcher le scroll/zoom sur mobile
  useEffect(() => {
    const preventGesture = (e: Event) => e.preventDefault();
    document.addEventListener('gesturestart', preventGesture);
    document.addEventListener('gesturechange', preventGesture);
    document.addEventListener('gestureend', preventGesture);

    return () => {
      document.removeEventListener('gesturestart', preventGesture);
      document.removeEventListener('gesturechange', preventGesture);
      document.removeEventListener('gestureend', preventGesture);
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Flux vidéo */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }} // Miroir pour visée naturelle
      />

      {/* Flash obturateur */}
      {flash && <div className="shutter-flash" />}

      {/* Overlay viseur vintage */}
      <div className="viewfinder-overlay">
        <div className="viewfinder-crosshair" />
      </div>

      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-vintage-bg/80 z-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-vintage-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-vintage-muted text-sm font-mono">Chargement...</p>
          </div>
        </div>
      )}

      {/* Erreur caméra */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-vintage-bg/90 z-20 p-6">
          <div className="text-center max-w-xs">
            <p className="text-vintage-text text-lg mb-2">📵</p>
            <p className="text-vintage-muted text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Barre supérieure */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 pt-6">
        {/* Compteur de poses */}
        <FilmCounter />

        {/* Indicateur profil */}
        <button
          onClick={onOpenRollSelector}
          className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-vintage-border/50 text-xs font-mono text-vintage-text hover:border-vintage-accent/60 transition-colors"
        >
          {currentProfile?.emoji ?? '🎞️'} {currentProfile?.label ?? 'Film'}
        </button>
      </div>

      {/* Barre inférieure */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between p-4 pb-8">
        {/* Bouton timer */}
        <button
          onClick={onOpenTimerSettings}
          className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm border border-vintage-border/50 flex items-center justify-center text-lg hover:border-vintage-accent/60 transition-colors"
          aria-label="Minuteur de développement"
        >
          ⏳
        </button>

        {/* Déclencheur */}
        <ShutterButton
          onCapture={handleCapture}
          disabled={!isReady || isLoading}
          remainingPoses={remainingPoses}
        />

        {/* Bouton switch caméra */}
        <button
          onClick={switchCamera}
          className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm border border-vintage-border/50 flex items-center justify-center text-lg hover:border-vintage-accent/60 transition-colors"
          aria-label="Changer de caméra"
        >
          🔄
        </button>
      </div>

      {/* Indicateur rouleau plein ou temps écoulé */}
      {(isFull || !canTakePhotos) && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-vintage-danger/20 backdrop-blur-sm border border-vintage-danger/40">
          <p className="text-xs font-mono text-red-400 text-center">
            {isFull ? `Rouleau plein — ${currentProject?.maxPoses ?? '?'}/${currentProject?.maxPoses ?? '?'} 📸` : '⏰ Fenêtre de prise de vue terminée'}
          </p>
        </div>
      )}
    </div>
  );
}