import { useRef, useState, useCallback } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import {
  primeFlashHaptics,
  flashToggleOn,
  flashToggleOff,
} from '../../lib/haptics';
import { useI18n } from '../../i18n/useI18n';

/** Distance de glissement pour basculer le flash (28 px). */
const PULL_THRESHOLD = 28;

interface FlashToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  available?: boolean;
}

/**
 * FlashToggle — Tige de flash tactile.
 *
 * Inspiré des anciens flashs jetables : une tige qu'on tire vers le HAUT
 * pour allumer le flash, et qu'on repousse vers le BAS pour l'éteindre.
 * Retour haptique + sonore à chaque basculement.
 */
export function FlashToggle({
  enabled,
  onToggle,
  available = false,
}: FlashToggleProps) {
  const { t } = useI18n();
  const trackRef = useRef<HTMLDivElement>(null);

  const [offset, setOffset] = useState(enabled ? PULL_THRESHOLD : 0);
  const [dragging, setDragging] = useState(false);

  const draggingRef = useRef(false);
  const startYRef = useRef(0);
  const offsetRef = useRef(enabled ? PULL_THRESHOLD : 0);
  const crossedThresholdRef = useRef(false);

  const applyOffset = useCallback(
    (newOffset: number, commit = false) => {
      const clamped = Math.max(0, Math.min(PULL_THRESHOLD, newOffset));
      offsetRef.current = clamped;
      setOffset(clamped);

      const crossed = clamped >= PULL_THRESHOLD * 0.75;

      if (crossed && !crossedThresholdRef.current && !enabled) {
        crossedThresholdRef.current = true;
        if (commit) {
          flashToggleOn();
          onToggle(true);
        }
      } else if (!crossed && crossedThresholdRef.current && enabled) {
        crossedThresholdRef.current = false;
        if (commit) {
          flashToggleOff();
          onToggle(false);
        }
      }
    },
    [enabled, onToggle],
  );

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!available) return;
    primeFlashHaptics();
    draggingRef.current = true;
    setDragging(true);
    crossedThresholdRef.current = false;
    startYRef.current = e.clientY;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch { /* ignore */ }
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const dy = startYRef.current - e.clientY; // positif = vers le haut
    applyOffset(dy);
  };

  const handlePointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);

    const snapped = offsetRef.current >= PULL_THRESHOLD * 0.5;
    if (snapped && !enabled) {
      flashToggleOn();
      onToggle(true);
      applyOffset(PULL_THRESHOLD, true);
    } else if (!snapped && enabled) {
      flashToggleOff();
      onToggle(false);
      applyOffset(0, true);
    } else if (snapped && enabled) {
      applyOffset(PULL_THRESHOLD, true);
    } else {
      applyOffset(0, true);
    }
  };

  const progress = offset / PULL_THRESHOLD;
  const ledColor = enabled
    ? 'bg-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.8)]'
    : 'bg-vintage-muted/50';
return (
    <div className="flex flex-col items-center gap-1.5 shrink-0">
      {/* Boîtier / rail de la tige (fixe) */}
      <div className="relative flex flex-col items-center">
        <div
          className="relative w-8 h-16 rounded-full border border-vintage-border/60 flex flex-col items-center justify-between py-1.5"
          style={{
            background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
            boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.4)',
          }}
        >
          {/* LED témoin (fixe en haut) */}
          <div className={`w-2 h-2 rounded-full transition-all duration-200 ${ledColor}`} />

          {/* Tige glissante */}
          <div
            ref={trackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            role="slider"
            aria-label={t('flash.aria')}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            aria-valuetext={enabled ? t('flash.on') : t('flash.off')}
            className={`
              absolute left-1/2 -translate-x-1/2
              w-10 h-10 rounded-full border border-vintage-border/70
              flex items-center justify-center transition-all duration-100
              ${available ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed opacity-40'}
            `}
            style={{
              bottom: `${8 + progress * 36}px`,
              background: 'linear-gradient(135deg, #3a3a5c 0%, #1a1a2e 100%)',
              boxShadow: dragging
                ? '0 2px 10px rgba(196,164,62,0.5), inset 0 1px 3px rgba(255,255,255,0.1)'
                : '0 1px 4px rgba(0,0,0,0.6), inset 0 1px 3px rgba(255,255,255,0.08)',
              touchAction: 'none',
            }}
          >
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${enabled ? 'bg-vintage-accent' : 'bg-vintage-muted'}`} />
          </div>

          {/* Repère OFF (bas) */}
          <div className={`w-4 h-[2px] rounded-full transition-colors ${!enabled ? 'bg-vintage-accent/60' : 'bg-vintage-border/40'}`} />

          {/* Gravure "FLASH" */}
          <div
            className="text-[7px] font-mono text-vintage-muted/60 tracking-widest leading-none"
            style={{ writingMode: 'vertical-rl' }}
          >
            FLASH
          </div>
        </div>
      </div>

      {/* Label d'état */}
      <span
        className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono whitespace-nowrap pointer-events-none backdrop-blur-sm border transition-colors ${
          !available
            ? 'text-vintage-muted/40 border-vintage-border/30 bg-black/20'
            : enabled
              ? 'text-yellow-300 border-yellow-300/40 bg-yellow-300/10'
              : 'text-vintage-muted border-vintage-border/40 bg-black/30'
        }`}
      >
        {!available ? t('flash.unavailable') : enabled ? t('flash.on') : t('flash.off')}
      </span>
    </div>
  );
}