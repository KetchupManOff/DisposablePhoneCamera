import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { useCamera } from '../../hooks/useCamera';
import { useFilmRoll } from '../../hooks/useFilmRoll';
import { OrientationToggle } from './OrientationToggle';
import { ShutterButton } from './ShutterButton';
import { FilmCounter } from './FilmCounter';
import { CrankWheel } from './CrankWheel';
import { FlashToggle } from './FlashToggle';
import { useColorProfile } from '../../hooks/useColorProfile';
import { useVolumeCapture } from '../../hooks/useVolumeCapture';
import { useLockTimer } from '../../hooks/useLockTimer';
import { useShutterSound } from '../../hooks/useShutterSound';
import { useFlash } from '../../hooks/useFlash';
import { getCamera } from '../../lib/cameras';
import { getEffectiveRatio, getRatioLabel } from '../../lib/ratio';
import { useI18n } from '../../i18n/useI18n';
import type { AspectRatio, Orientation } from '../../types';

interface ViewfinderProps {
  onOpenRollSelector: () => void;
  onOpenTimerSettings: () => void;
  onOpenGallery: () => void;
  onOpenAbout: () => void;
}

/**
 * Affiche un masque semi-transparent qui révèle uniquement la zone
 * qui sera effectivement capturée selon le ratio configuré sur le projet.
 */
function AspectRatioMask({
  aspectRatio,
  orientation,
  viewportRef,
}: {
  aspectRatio: AspectRatio;
  orientation: Orientation;
  viewportRef: React.RefObject<HTMLDivElement>;
}) {
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setDims({ w: rect.width, h: rect.height });
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [viewportRef]);

  const mask = useMemo(() => {
    const targetRatio = getEffectiveRatio(aspectRatio, orientation);
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
  }, [aspectRatio, orientation, dims]);

  if (dims.w === 0 || dims.h === 0) return null;

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
        <div className="absolute left-0 right-0 bg-vintage-bg backdrop-blur-[1px]"
          style={{ top: 0, height: mask.top }} />
      )}
      {mask.bottom > 0 && (
        <div className="absolute left-0 right-0 bg-vintage-bg backdrop-blur-[1px]"
          style={{ bottom: 0, height: mask.bottom }} />
      )}
      {mask.left > 0 && (
        <div className="absolute top-0 bottom-0 bg-vintage-bg backdrop-blur-[1px]"
          style={{ left: 0, width: mask.left }} />
      )}
      {mask.right > 0 && (
        <div className="absolute top-0 bottom-0 bg-vintage-bg backdrop-blur-[1px]"
          style={{ right: 0, width: mask.right }} />
      )}
      {/* Cadre doré */}
      <div className="absolute border-[3px] border-vintage-accent/45 rounded-sm"
        style={{ top: mask.top, bottom: mask.bottom, left: mask.left, right: mask.right }} />
      {/* Coins accentués */}
      {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
        <div
          key={corner}
          className="absolute w-5 h-5 border-vintage-accent/70"
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
  const { t } = useI18n();
  // 2026-09-03 — Selfie mode removed: always use back camera (environment).
  const { videoRef, stream, error, isLoading, isReady } = useCamera();
  const { capturePhoto, remainingPoses, isFull, canTakePhotos } = useFilmRoll();
  const currentProject = useStore((s) => s.currentProject());
  const updateCurrentProjectSettings = useStore((s) => s.updateCurrentProjectSettings);
  const flashEnabled = useStore((s) => s.flashEnabled);
  const setFlashEnabled = useStore((s) => s.setFlashEnabled);
  const { currentProfile } = useColorProfile();
  const camera = getCamera(currentProject?.cameraId ?? null);
  const [flash, setFlash] = useState(false);
  const [isCranked, setIsCranked] = useState(false);
  const previewAreaRef = useRef<HTMLDivElement>(null);
  const playShutter = useShutterSound();
  const { torchAvailable, setTorch } = useFlash(stream);

  // Détection de l'orientation physique du device (paysage CSS = landscape)
  // pour adapter le FlashToggle (horizontal en paysage, vertical en portrait).
  const [isDeviceLandscape, setIsDeviceLandscape] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(orientation: landscape)').matches,
  );
  useEffect(() => {
    const mql = window.matchMedia('(orientation: landscape)');
    const handler = (e: MediaQueryListEvent) => setIsDeviceLandscape(e.matches);
    mql.addEventListener('change', handler);
    setIsDeviceLandscape(mql.matches);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Flash torche : ne s'active QUE lors de la capture, comme un vrai flash
  // d'appareil photo jetable. La tige tactile arme le flash ; le déclencheur
  // l'active brièvement (pulse ~200 ms) au moment de la prise de vue.

  const aspectRatio = currentProject?.aspectRatio ?? '3:2';
  const orientation = currentProject?.orientation ?? 'landscape';
  const photosCount = currentProject?.photos.length ?? 0;
  const { isLocked, timeRemaining, takingTimeRemaining, isTakingWindowOver } = useLockTimer();

  const ratioBadge = useMemo(() => {
    if (aspectRatio === '1:1') return '⬜ 1:1';
    const emoji = aspectRatio === '16:9' ? '🎬' : '📐';
    return `${emoji} ${getRatioLabel(aspectRatio, orientation)}`;
  }, [aspectRatio, orientation]);

  const handleCapture = useCallback(async () => {
    if (!videoRef.current || !canTakePhotos) return;
    if (!isReady) return;
    if (!isCranked) return;

    // Flash torche matériel : pulse bref au moment de la capture
    // (comme un vrai flash d'appareil photo jetable)
    let torchUsed = false;
    if (flashEnabled && torchAvailable) {
      torchUsed = true;
      await setTorch(true);
      // Laisser le temps à la LED d'illuminer la scène (~200 ms)
      await new Promise((r) => setTimeout(r, 200));
    }

    // Flash visuel de l'obturateur (overlay blanc à l'écran)
    setFlash(true);
    setTimeout(() => setFlash(false), 350);

    // Son d'obturateur (déclenché en même temps que le flash)
    playShutter();

    // 2026-09-03 — Selfie mode removed: no mirror needed (always back camera).
    const photo = await capturePhoto(videoRef.current, false);
    if (photo) {
      setIsCranked(false);
    }

    // Éteindre la torche après capture
    if (torchUsed) {
      await setTorch(false);
    }
  }, [videoRef, canTakePhotos, capturePhoto, isReady, isCranked, playShutter, flashEnabled, torchAvailable, setTorch]);

  const toggleOrientation = useCallback(() => {
    updateCurrentProjectSettings({
      orientation: orientation === 'portrait' ? 'landscape' : 'portrait',
    });
  }, [orientation, updateCurrentProjectSettings]);

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

  // Chaque pose nécessite de ré-armer la molette. Changer de projet (nouvelle
  // pellicule) réinitialise aussi l'armement.
  useEffect(() => {
    setIsCranked(false);
  }, [currentProject?.id]);

  return (
    <div className="w-full h-full bg-vintage-bg overflow-hidden flex flex-col landscape:flex-row">
      {/* === ZONE CAMÉRA === */}
      <div className="relative flex-1 min-h-0 min-w-0 flex flex-col bg-black">
        {/* === BARRE SUPÉRIEURE : statut + actions === */}
        <div
          className="z-30 px-3 pb-2 bg-vintage-bg"
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
                {ratioBadge}
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
                aria-label={t('viewfinder.viewRoll')}
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
                  {t('viewfinder.timeUp')}
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

        {/* === PRÉVISUALISATION (le champ de la photo) === */}
        <div ref={previewAreaRef} className="relative flex-1 min-h-0 min-w-0 overflow-hidden">
          {/* Flux vidéo */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Masque de ratio (zone capturée) */}
          <AspectRatioMask aspectRatio={aspectRatio} orientation={orientation} viewportRef={previewAreaRef} />

          {/* Flash obturateur */}
          {flash && <div className="shutter-flash" />}

          {/* Crosshair vintage subtil */}
          <div className="viewfinder-overlay">
            <div className="viewfinder-crosshair" />
          </div>

          {/* Indicateur rouleau plein ou temps écoulé */}
          {(isFull || !canTakePhotos) && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-vintage-danger/20 backdrop-blur-sm border border-vintage-danger/40">
              <p className="text-xs font-mono text-red-400 text-center">
                {isFull
                  ? t('viewfinder.rollFull', { max: currentProject?.maxPoses ?? '?' })
                  : t('viewfinder.shootingOver')}
              </p>
            </div>
          )}

          {/* Indicateur de chargement */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-vintage-bg/80 z-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-vintage-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-vintage-muted text-sm font-mono">{t('viewfinder.loading')}</p>
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
        </div>
      </div>

      {/* === PANNEAU DE CONTRÔLES (bas en portrait, droite en paysage) === */}
      {/* 2026-08-29 — Relocalisation de la molette en paysage.
        IMPORTANT — En paysage physique (iPhone horizontal), le panneau est une
        colonne sur le côté droit. Si la molette d'armement est en haut, elle se
        retrouve dans l'angle SUPÉRIEUR DROIT, exactement là où iOS déclenche le
        « Centre de contrôle » (glissement depuis le coin) → impossible de armer.
        En paysage on inverse donc la colonne (flex-col-reverse) pour que la
        molette soit EN BAS. En portrait (flex-row) l'ordre reste inchangé.

        NB : le padding bas est aussi renforcé en paysage (2.5rem) pour garder
        la molette hors de portée du geste « Accueil » (glissement depuis le
        bord inférieur de l'écran).
      */}
      <div
        className="shrink-0 z-30 flex flex-row landscape:flex-col-reverse items-center justify-between landscape:justify-center gap-3 border-t landscape:border-t-0 landscape:border-l border-vintage-border/40 bg-vintage-bg pt-4 pl-[calc(env(safe-area-inset-left,0px)+1rem)] pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] landscape:pb-[calc(env(safe-area-inset-bottom,0px)+2.5rem)] pr-[calc(env(safe-area-inset-right,0px)+1rem)]"
      >
        {/* Molette d'armement */}
        {canTakePhotos && (
          <CrankWheel isCocked={isCranked} onCocked={() => setIsCranked(true)} />
        )}

        {/* Tige de flash (tactile) */}
        {canTakePhotos && (
          <FlashToggle
            enabled={flashEnabled}
            onToggle={setFlashEnabled}
            available={torchAvailable}
            horizontal={isDeviceLandscape}
          />
        )}

        {/* Déclencheur (grand bouton) */}
        <ShutterButton
          onCapture={handleCapture}
          disabled={!isReady || isLoading}
          remainingPoses={remainingPoses}
          isCranked={isCranked}
        />

        {/* Boutons utilitaires : orientation, timer, à propos */}
        <div className="flex flex-row items-center gap-1.5">
          <OrientationToggle
            orientation={orientation}
            onChange={toggleOrientation}
          />
          {/* 2026-08-29 — Le sablier (réglages timer/développement) n'est accessible
              qu'en mode \"Control freak\". En mode simple, les réglages sont
              verrouillés après la création du rouleau, comme un vrai jetable. */}
          {currentProject?.mode === 'control' && (
            <button
              onClick={onOpenTimerSettings}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-vintage-border/50 flex items-center justify-center text-base hover:border-vintage-accent/60 transition-colors"
              aria-label={t('viewfinder.timer')}
            >
              ⏳
            </button>
          )}
          <button
            onClick={onOpenAbout}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-vintage-border/50 flex items-center justify-center text-sm hover:border-vintage-accent/60 transition-colors"
            aria-label={t('viewfinder.about')}
          >
            ⓘ
          </button>
        </div>
      </div>
    </div>
  );
}