// Easing curves for the motion system. Each is a CSS cubic-bezier string, which is valid both
// for CSS `transition-timing-function` / Tailwind arbitrary values AND for the Web Animations
// API `easing` option — so one source serves both declarative and imperative animations.

export const EASE = {
  /** Canonical gentle ease-out (decelerate). Default for entrances & state changes (spec §6). */
  out: 'cubic-bezier(0.22, 1, 0.36, 1)',
  /** Symmetric ease-in-out for reversible transitions (underline slide, colour crossfade). */
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /** Spring-like overshoot for pops (check-circle, badge, add-to-cart bounce). */
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  /** Ease-in (accelerate) for exits (sheet dismiss). */
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  linear: 'linear',
} as const;

export type EaseName = keyof typeof EASE;
