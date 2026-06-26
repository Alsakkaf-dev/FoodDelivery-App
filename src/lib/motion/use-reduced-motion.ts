'use client';
import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * React hook for the OS "reduce motion" preference. SSR-safe: returns `false` on the server and
 * on the first client paint (so server and client markup match — no hydration mismatch), then
 * corrects on mount and stays live (responds to the user toggling the preference at runtime).
 *
 * Use it to gate DELIGHT animations (confetti, splash sunburst, fly-to-cart, pulse rings). Keep
 * ESSENTIAL feedback (press, selection, success acknowledgement) — those are handled so that the
 * element simply appears in its final state when motion is reduced, conveying no info via motion.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(QUERY);
    const update = () => setReduced(mq.matches);
    update();
    // Modern browsers use addEventListener; Safari < 14 only has addListener.
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);
  return reduced;
}

/** Imperative check for non-React call sites (WAAPI helpers). Safe to call on the server. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(QUERY).matches;
}
