// Headless confetti burst. SUCCESS-ONLY palette (design spec §6: lavender / yellow / peach).
// DOM spans animated via the Web Animations API and auto-removed; no canvas, no dependency.
// No-op under reduced motion. Deterministic (index-derived spread, no Math.random) so it never
// causes SSR/hydration surprises. No `'use client'` — guarded for SSR, runs only when called.

import { CONFETTI_COLORS } from './tokens';
import { EASE } from './easings';

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

function reduceMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(REDUCED_QUERY).matches
  );
}

export interface ConfettiOptions {
  count?: number;
  durationMs?: number;
  spreadPx?: number;
}

/**
 * Burst confetti from the centre-top of `host` (give it `position: relative; overflow: visible`).
 * Returns a cleanup function that removes any in-flight pieces (call it from an effect's teardown).
 * No-op under reduced motion / SSR / no-WAAPI — returns a harmless empty cleanup.
 */
export function burstConfetti(
  host: HTMLElement | null | undefined,
  opts: ConfettiOptions = {},
): () => void {
  const { count = 16, durationMs = 900, spreadPx = 120 } = opts;
  if (
    !host ||
    typeof document === 'undefined' ||
    typeof Element === 'undefined' ||
    typeof Element.prototype.animate !== 'function' ||
    reduceMotion()
  ) {
    return () => {};
  }

  const pieces: HTMLElement[] = [];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length] ?? CONFETTI_COLORS[0];
    piece.setAttribute('aria-hidden', 'true');
    piece.style.position = 'absolute';
    piece.style.left = '50%';
    piece.style.top = '40%';
    piece.style.width = '8px';
    piece.style.height = '8px';
    piece.style.borderRadius = '2px';
    piece.style.background = color;
    piece.style.pointerEvents = 'none';
    host.appendChild(piece);
    pieces.push(piece);

    const angle = (Math.PI * 2 * i) / count + (i % 2 ? 0.2 : -0.2);
    const dist = spreadPx * (0.6 + ((i * 37) % 40) / 100);
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - 40; // bias the spray upward
    const rot = (i % 2 ? 1 : -1) * (180 + ((i * 53) % 180));

    piece.animate(
      [
        { transform: 'translate(-50%, -50%) rotate(0deg)', opacity: 1, offset: 0 },
        {
          transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rot}deg)`,
          opacity: 1,
          offset: 0.7,
        },
        {
          transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 60}px)) rotate(${rot}deg)`,
          opacity: 0,
          offset: 1,
        },
      ],
      { duration: durationMs + (i % 5) * 60, easing: EASE.out, fill: 'forwards' },
    );
  }

  const cleanup = () => {
    pieces.forEach((p) => p.remove());
    pieces.length = 0;
  };
  window.setTimeout(cleanup, durationMs + 400);
  return cleanup;
}
