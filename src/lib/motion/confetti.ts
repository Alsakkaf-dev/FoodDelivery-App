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
