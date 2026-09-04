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
  /** Quand true, la tige est horizontale (glissement gauche → droite). */
  horizontal?: boolean;
}

/**
 * FlashToggle — Tige de flash tactile.
 *
 * Inspiré des anciens flashs jetables : une tige qu'on tire vers le HAUT
 * (portrait) ou vers la DROITE (paysage) pour allumer le flash,
 * et qu'on repousse vers le BAS / la GAUCHE pour l'éteindre.
 * Retour haptique + sonore à chaque basculement.
 */
export function FlashToggle({
  enabled,
  onToggle,
  available = false,
  horizontal = false,
}: FlashToggleProps) {
  const { t } = useI18n();
  const trackRef = useRef<HTMLDivElement>(null);

  const [offset, setOffset] = useState(enabled ? PULL_THRESHOLD : 0);
  const [dragging, setDragging] = useState(false);

  const draggingRef = useRef(false);
  const startCoordRef = useRef(0);
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

  /** Distance positive dans la direction d'activation (vers le haut ou la droite). */
  const activationDelta = useCallback(
    (currentClient: number) => {
      if (horizontal) {
        // Activation vers la DROITE → dx positif
        return currentClient - startCoordRef.current;
      }
      // Activation vers le HAUT → dy négatif → on inverse
      return startCoordRef.current - currentClient;
    },
    [horizontal],
  );

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!available) return;
    primeFlashHaptics();
    draggingRef.current = true;
    setDragging(true);
    crossedThresholdRef.current = false;
    startCoordRef.current = horizontal ? e.clientX : e.clientY;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch { /* ignore */ }
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const delta = activationDelta(horizontal ? e.clientX : e.clientY);
    applyOffset(delta);
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
  const led = enabled
    ? 'bg-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.8)]'
    : 'bg-vintage-muted/50';
  const labelCls = `px-1.5 py-0.5 rounded-full text-[10px] font-mono whitespace-nowrap pointer-events-none backdrop-blur-sm border transition-colors ${!available ? 'text-vintage-muted/40 border-vintage-border/30 bg-black/20' : enabled ? 'text-yellow-300 border-yellow-300/40 bg-yellow-300/10' : 'text-vintage-muted border-vintage-border/40 bg-black/30'}`;
  const stemCls = `absolute w-10 h-10 rounded-full border border-vintage-border/70 flex items-center justify-center transition-all duration-100 ${available ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed opacity-40'}`;
  const a11y = {
    role: 'slider' as const,
    'aria-label': t('flash.aria'),
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': Math.round(progress * 100),
    'aria-valuetext': enabled ? t('flash.on') : t('flash.off'),
  };
  const dot = <div className={`w-1.5 h-1.5 rounded-full transition-colors ${enabled ? 'bg-vintage-accent' : 'bg-vintage-muted'}`} />;
/* ── Vertical (portrait) ── */
  if (!horizontal) {
    return (
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <div className="relative flex flex-col items-center">
          <div
            className="relative w-8 h-16 rounded-full border border-vintage-border/60 flex flex-col items-center justify-between py-1.5"
            style={{ background: 'linear-gradient(180deg, var(--color-surface) 0%, var(--color-bg) 100%)', boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.4)' }}
          >
            <div className={`w-2 h-2 rounded-full transition-all duration-200 ${led}`} />
            <div ref={trackRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} {...a11y}
              className={`${stemCls} left-1/2 -translate-x-1/2`}
              style={{ bottom: `${8 + progress * 36}px`, background: 'linear-gradient(135deg, var(--color-border) 0%, var(--color-surface) 100%)', boxShadow: dragging ? '0 2px 10px rgba(var(--color-accent-rgb), 0.5), inset 0 1px 3px rgba(255,255,255,0.1)' : '0 1px 4px rgba(0,0,0,0.6), inset 0 1px 3px rgba(255,255,255,0.08)', touchAction: 'none' }}
            >{dot}</div>
            <div className={`w-4 h-[2px] rounded-full transition-colors ${!enabled ? 'bg-vintage-accent/60' : 'bg-vintage-border/40'}`} />
            <div className="text-[7px] font-mono text-vintage-muted/60 tracking-widest leading-none" style={{ writingMode: 'vertical-rl' }}>FLASH</div>
          </div>
        </div>
        <span className={labelCls}>{!available ? t('flash.unavailable') : enabled ? t('flash.on') : t('flash.off')}</span>
      </div>
    );
  }

  /* ── Horizontal (paysage) ── */
  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0">
      <div className="relative flex flex-row items-center">
        <div
          className="relative h-8 w-16 rounded-full border border-vintage-border/60 flex flex-row items-center justify-between px-1.5"
          style={{ background: 'linear-gradient(90deg, var(--color-surface) 0%, var(--color-bg) 100%)', boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.4)' }}
        >
          <div className={`h-4 w-[2px] rounded-full transition-colors ${!enabled ? 'bg-vintage-accent/60' : 'bg-vintage-border/40'}`} />
          <div className="text-[7px] font-mono text-vintage-muted/60 tracking-widest leading-none">FLASH</div>
          <div ref={trackRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} {...a11y}
            className={`${stemCls} top-1/2 -translate-y-1/2`}
            style={{ left: `${8 + progress * 36}px`, background: 'linear-gradient(135deg, var(--color-border) 0%, var(--color-surface) 100%)', boxShadow: dragging ? '0 2px 10px rgba(var(--color-accent-rgb), 0.5), inset 0 1px 3px rgba(255,255,255,0.1)' : '0 1px 4px rgba(0,0,0,0.6), inset 0 1px 3px rgba(255,255,255,0.08)', touchAction: 'none' }}
          >{dot}</div>
          <div className={`w-2 h-2 rounded-full transition-all duration-200 ${led}`} />
        </div>
      </div>
      <span className={labelCls}>{!available ? t('flash.unavailable') : enabled ? t('flash.on') : t('flash.off')}</span>
    </div>
  );
}