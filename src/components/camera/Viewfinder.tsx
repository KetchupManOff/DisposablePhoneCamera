import { useState, useCallback, useEffect, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { useCamera } from '../../hooks/useCamera';
import { useFilmRoll } from '../../hooks/useFilmRoll';
import { ShutterButton } from './ShutterButton';
import { FilmCounter } from './FilmCounter';
import { useColorProfile } from '../../hooks/useColorProfile';
import { useVolumeCapture } from '../../hooks/useVolumeCapture';
import { useLockTimer } from '../../hooks/useLockTimer';
import { getCamera } from '../../lib/cameras';

interface ViewfinderProps {
  onOpenRollSelector: () => void;
  onOpenTimerSettings: () => void;
  onOpenGallery: () => void;
  onOpenAbout: () => void;
}

const RATIO_LABELS: Record<string, string> = {
  '1:1': '⬜ 1:1',
  '3:2': '📐 3:2',
  '4:3': '📐 4:3',
  '16:9': '🎬 16:9',
};

/**
 * Affiche un masque semi-transparent qui révèle uniquement la zone
 * qui sera effectivement capturée selon le ratio configuré sur le projet.
 */
function AspectRatioMask({ aspectRatio }: { aspectRatio: string }) {
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const mask = useMemo(() => {
    const ratioMap: Record<string, number> = {
      '1:1': 1,
      '3:2': 3 / 2,
      '4:3': 4 / 3,
      '16:9': 16 / 9,
    };
    const targetRatio = ratioMap[aspectRatio] ?? dims.w / dims.h;
    const screenRatio = dims.w / dims.h;

    if (Math.abs(targetRatio - screenRatio) < 0.01) {
      return { top: 0, bottom: 0, left: 0, right: 0 };
    }

    if (targetRatio > screenRatio) {
      const visibleH = dims.w / targetRatio;
      const barH = (dims.h - visibleH) / 2;
      return { top: barH, bottom: barH, left: 0, right: 0 };
    } else {
      const visibleW = dims.h * targetRatio;
      const barW = (dims.w - visibleW) / 2;
      return { top: 0, bottom: 0, left: barW, right: barW };
    }
  }, [aspectRatio, dims]);

  if (mask.left === 0 && mask.right === 0 && mask.top === 0 && mask.bottom === 0) {
    return (
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute inset-0 border-2 border-vintage-accent/40 rounded-sm" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {mask.top > 0 && (
        <div className="absolute left-0 right-0 bg-black/50 backdrop-blur-[1px]"
          style={{ top: 0, height: mask.top }} />
      )}
      {mask.bottom > 0 && (
        <div className="absolute left-0 right-0 bg-black/50 backdrop-blur-[1px]"
          style={{ bottom: 0, height: mask.bottom }} />
      )}
      {mask.left > 0 && (
        <div className="absolute top-0 bottom-0 bg-black/50 backdrop-blur-[1px]"
          style={{ left: 0, width: mask.left }} />
      )}
      {mask.right > 0 && (
        <div className="absolute top-0 bottom-0 bg-black/50 backdrop-blur-[1px]"
          style={{ right: 0, width: mask.right }} />
      )}
      {/* Cadre doré */}
      <div className="absolute border-2 border-vintage-accent/40 rounded-sm"
        style={{ top: mask.top, bottom: mask.bottom, left: mask.left, right: mask.right }} />
      {/* Coins accentués */}
      {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
        <div
          key={corner}
          className="absolute w-4 h-4 border-vintage-accent/60"
          style={{
            top: corner.startsWith('t') ? (mask.top > 0 ? mask.top + 4 : 4) : undefined,
            bottom: corner.startsWith('b') ? (mask.bottom > 0 ? mask.bottom + 4 : 4) : undefined,
            left: corner.endsWith('l') ? (mask.left > 0 ? mask.left + 4 : 4) : undefined,
            right: corner.endsWith('r') ? (mask.right > 0 ? mask.right + 4 : 4) : undefined,
            borderTop: corner.startsWith('t') ? '2px solid' : 'none',
            borderBottom: corner.startsWith('b') ? '2px solid' : 'none',
            borderLeft: corner.endsWith('l') ? '2px solid' : 'none',
            borderRight: corner.endsWith('r') ? '2px solid' : 'none',
          }}
        />
      ))}
    </div>
  );
}

export function Viewfinder({
  onOpenRollSelector,
  onOpenTimerSettings,
  onOpenGallery,
  onOpenAbout,
}: ViewfinderProps) {
  const { videoRef, error, isLoading, isReady, switchCamera, isBackCamera, facingMode } = useCamera();
  const { capturePhoto, remainingPoses, isFull, canTakePhotos } = useFilmRoll();
  const currentProject = useStore((s) => s.currentProject());
  const { currentProfile } = useColorProfile();
  const camera = getCamera(currentProject?.cameraId ?? null);
  const [flash, setFlash] = useState(false);

  const aspectRatio = currentProject?.aspectRatio ?? '3:2';
  const photosCount = currentProject?.photos.length ?? 0;
  const { isLocked, timeRemaining, takingTimeRemaining, isTakingWindowOver } = useLockTimer();

  const handleCapture = useCallback(async () => {
    if (!videoRef.current || !canTakePhotos) return;
    if (!isReady) return;

    // Flash de l'obturateur
    setFlash(true);
    setTimeout(() => setFlash(false), 350);

    // Miroir uniquement pour la caméra AVANT (selfie) : l'arrière reste normal.
    await capturePhoto(videoRef.current, !isBackCamera);
  }, [videoRef, canTakePhotos, capturePhoto, isReady, isBackCamera]);

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
        style={{ transform: !isBackCamera ? 'scaleX(-1)' : undefined }}
      />

      {/* Masque de ratio (zone capturée) */}
      <AspectRatioMask aspectRatio={aspectRatio} />

      {/* Flash obturateur */}
      {flash && <div className="shutter-flash" />}

      {/* Crosshair vintage subtil */}
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

      {/* === LÈVRE SUPÉRIEURE : compense l'encoche / la caméra qui coupe l'écran === */}
      <div
        className="absolute top-0 left-0 right-0 z-20 bg-black"
        style={{ height: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
      />

      {/* === BARRE SUPÉRIEURE : statut + actions === */}
      <div
        className="absolute top-0 left-0 right-0 z-30 px-3"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
      >
        {/* Rangée principale */}
        <div className="flex items-center justify-between gap-2">
          {/* Gauche : compteur de poses */}
          <FilmCounter />

          {/* Droite : ratio + profil + galerie (une seule rangée) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Badge ratio */}
            <span className="h-9 flex items-center px-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-vintage-accent/30 text-[9px] font-mono text-vintage-accent/80 whitespace-nowrap shrink-0">
              {RATIO_LABELS[aspectRatio] ?? aspectRatio}
            </span>

            {/* Profil couleur */}
            <button
              onClick={onOpenRollSelector}
              className="h-9 max-w-[96px] px-2 rounded-full bg-black/40 backdrop-blur-sm border border-vintage-border/50 text-[11px] font-mono text-vintage-text hover:border-vintage-accent/60 transition-colors flex items-center whitespace-nowrap overflow-hidden shrink-0"
            >
              <span className="truncate">
                {currentProject?.mode === 'simple' && camera
                  ? `${camera.emoji} ${camera.label}`
                  : `${currentProfile?.emoji ?? '🎞️'} ${currentProfile?.label ?? 'Film'}`}
              </span>
            </button>

            {/* Galerie / rouleau */}
            <button
              onClick={onOpenGallery}
              className="relative w-9 h-9 shrink-0 rounded-full bg-black/40 backdrop-blur-sm border border-vintage-border/50 flex items-center justify-center text-base hover:border-vintage-accent/60 transition-colors"
              aria-label="Voir le rouleau"
            >
              🎞️
              {photosCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-vintage-accent text-[9px] font-mono text-black flex items-center justify-center leading-none">
                  {photosCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Bande de statut dédiée : sous la barre, jamais sur les coins */}
        {(isTakingWindowOver && !isLocked) || isLocked || takingTimeRemaining ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {isTakingWindowOver && !isLocked && (
              <div className="px-3 py-1 rounded-full bg-vintage-danger/20 backdrop-blur-sm border border-vintage-danger/40 text-[11px] font-mono text-red-400 whitespace-nowrap">
                ⏰ Temps écoulé
              </div>
            )}
            {isLocked && timeRemaining && (
              <div className="px-3 py-1 rounded-full bg-vintage-accent/20 backdrop-blur-sm border border-vintage-accent/40 text-[11px] font-mono text-vintage-accent whitespace-nowrap">
                🔒 {timeRemaining}
              </div>
            )}
            {takingTimeRemaining && (
              <div className="px-3 py-1 rounded-full bg-vintage-surface/50 backdrop-blur-sm border border-vintage-border/40 text-[11px] font-mono text-vintage-muted whitespace-nowrap">
                {takingTimeRemaining}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* === BARRE INFÉRIEURE === */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        {/* Rangée principale : boutons d'action */}
        <div className="flex items-center justify-between px-4 pb-3">
          {/* Groupe gauche : timer + about */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenTimerSettings}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-vintage-border/50 flex items-center justify-center text-base hover:border-vintage-accent/60 transition-colors"
              aria-label="Minuteur de développement"
            >
              ⏳
            </button>
            <button
              onClick={onOpenAbout}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-vintage-border/50 flex items-center justify-center text-sm hover:border-vintage-accent/60 transition-colors"
              aria-label="À propos"
            >
              ⓘ
            </button>
          </div>

          {/* Déclencheur (centre) */}
          <ShutterButton
            onCapture={handleCapture}
            disabled={!isReady || isLoading}
            remainingPoses={remainingPoses}
          />

          {/* Groupe droite : switch caméra */}
          <div className="flex items-center gap-2">
            <button
              onClick={switchCamera}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-vintage-border/50 flex items-center justify-center text-base hover:border-vintage-accent/60 transition-colors"
              aria-label="Changer de caméra"
              title={facingMode === 'environment' ? 'Caméra arrière (dos)' : 'Caméra avant (selfie)'}
            >
              {facingMode === 'environment' ? '🎥' : '🤳'}
            </button>
          </div>
        </div>

        {/* Safe area spacer pour les devices avec home indicator */}
        <div style={{ height: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }} />
      </div>

      {/* Indicateur rouleau plein ou temps écoulé */}
      {(isFull || !canTakePhotos) && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-vintage-danger/20 backdrop-blur-sm border border-vintage-danger/40">
          <p className="text-xs font-mono text-red-400 text-center">
            {isFull ? `Rouleau plein — ${currentProject?.maxPoses ?? '?'}/${currentProject?.maxPoses ?? '?'} 📸` : '⏰ Fenêtre de prise de vue terminée'}
          </p>
        </div>
      )}
    </div>
  );
}