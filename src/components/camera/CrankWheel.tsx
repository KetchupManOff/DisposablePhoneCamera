import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { crankTick, crankComplete, primeCrankHaptics } from '../../lib/haptics';
import { useI18n } from '../../i18n/useI18n';

/** Angle entre deux détentes successives de la molette. */
const DEG_PER_DETENT = 45;
/** Nombre de détentes (clic-clac) pour armer complètement le film. */
const DETENTS_TO_COCK = 8;

interface CrankWheelProps {
  /** Vrai quand le film est armé (prêt à photographier). */
  isCocked: boolean;
  /** Appelé une fois que la molette a été tournée suffisamment. */
  onCocked: () => void;
}

/** Ramène un angle delta dans ]-180, 180]. */
function normalizeDelta(delta: number): number {
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  return delta;
}

export function CrankWheel({ isCocked, onCocked }: CrankWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  // Accumulateurs « logiques » (fiables même entre deux rendus React).
  const rotationRef = useRef(0);
  const detentsRef = useRef(0);
  const lastAngleRef = useRef<number | null>(null);
  const isCockedRef = useRef(isCocked);
  const draggingRef = useRef(false);

  // États de rendu.
  const [rotation, setRotation] = useState(0);
  const [detents, setDetents] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    isCockedRef.current = isCocked;
    // Réarmement pour la pose suivante (ou nouveau projet).
    if (!isCocked) {
      rotationRef.current = 0;
      detentsRef.current = 0;
      lastAngleRef.current = null;
      draggingRef.current = false;
      setRotation(0);
      setDetents(0);
      setDragging(false);
    }
  }, [isCocked]);

  const angleFromPointer = (clientX: number, clientY: number): number => {
    const el = wheelRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (isCockedRef.current) return;
    // Débloque le contexte audio dès le premier contact (exigence iOS).
    primeCrankHaptics();
    draggingRef.current = true;
    setDragging(true);
    lastAngleRef.current = angleFromPointer(e.clientX, e.clientY);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || isCockedRef.current) return;
    if (lastAngleRef.current === null) {
      lastAngleRef.current = angleFromPointer(e.clientX, e.clientY);
      return;
    }

    const angle = angleFromPointer(e.clientX, e.clientY);
    const delta = normalizeDelta(angle - lastAngleRef.current);
    lastAngleRef.current = angle;

    // Cliquet unidirectionnel : seul le sens horaire arme le film.
    if (delta <= 0) return;

    const maxRotation = DETENTS_TO_COCK * DEG_PER_DETENT;
    const total = Math.min(maxRotation, rotationRef.current + delta);
    rotationRef.current = total;
    setRotation(total);

    const newDetents = Math.floor(total / DEG_PER_DETENT);
    if (newDetents > detentsRef.current) {
      const steps = newDetents - detentsRef.current;
      detentsRef.current = newDetents;
      setDetents(newDetents);
      for (let i = 0; i < steps; i++) crankTick();

      if (newDetents >= DETENTS_TO_COCK) {
        crankComplete();
        isCockedRef.current = true; // verrouille immédiatement (anti-rebond)
        draggingRef.current = false;
        setDragging(false);
        lastAngleRef.current = null;
        onCocked();
      }
    }
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    lastAngleRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const progress = Math.min(1, detents / DETENTS_TO_COCK);
  const RING = 2 * Math.PI * 44; // circonférence du cercle SVG (r = 44)

  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div
        ref={wheelRef}
        role="slider"
        aria-label={t('crank.aria')}
        aria-valuemin={0}
        aria-valuemax={DETENTS_TO_COCK}
        aria-valuenow={isCocked ? DETENTS_TO_COCK : detents}
        aria-valuetext={isCocked ? t('crank.cocked') : t('crank.armProgress', { detents, total: DETENTS_TO_COCK })}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={`
          relative w-24 h-24 rounded-full
          ${dragging ? 'cursor-grabbing' : isCocked ? 'cursor-default' : 'cursor-grab'}
          ${!isCocked && !dragging ? 'animate-pulse-glow' : ''}
        `}
        style={{ touchAction: 'none' }}
      >
        {/* Jante moletée (statique) */}
        <div
          className="absolute inset-0 rounded-full border border-vintage-border/70"
          style={{
            background: 'repeating-conic-gradient(#23233a 0deg 12deg, #0f0f1a 12deg 18deg)',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8), 0 4px 14px rgba(0,0,0,0.5)',
          }}
        />

        {/* Anneau de progression (doré) */}
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 96 96">
          <circle
            cx="48"
            cy="48"
            r="44"
            fill="none"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="3"
          />
          <circle
            cx="48"
            cy="48"
            r="44"
            fill="none"
            stroke="#c4a43e"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${progress * RING} ${RING}`}
            style={{
              transition: 'stroke-dasharray 0.15s ease-out',
              opacity: isCocked ? 0 : 1,
            }}
          />
        </svg>

        {/* Disque rotatif + repère */}
        <div
          className="absolute inset-[12px] rounded-full border border-vintage-border/60 bg-gradient-to-b from-vintage-surface to-vintage-bg"
          style={{
            transform: `rotate(${rotation}deg)`,
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.6)',
          }}
        >
          <div
            className="absolute left-1/2 -translate-x-1/2 -top-[3px] w-2.5 h-5 rounded-full bg-vintage-accent"
            style={{ boxShadow: '0 0 8px rgba(196,164,62,0.9)' }}
          />
        </div>

        {/* Moyeu central (état) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className={`text-2xl leading-none transition-colors ${
              isCocked ? 'text-vintage-accent' : 'text-vintage-muted'
            }`}
          >
            {isCocked ? '✓' : '↻'}
          </span>
        </div>
      </div>

      {/* Libellé d'état */}
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-mono whitespace-nowrap pointer-events-none backdrop-blur-sm border ${
          isCocked
            ? 'text-vintage-accent border-vintage-accent/40 bg-vintage-accent/10'
            : 'text-vintage-muted border-vintage-border/40 bg-black/30'
        }`}
      >
        {isCocked ? t('crank.armed') : t('crank.arm')}
      </span>
    </div>
  );
}
