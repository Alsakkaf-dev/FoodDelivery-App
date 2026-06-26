// Reusable motion variants — declarative, serialisable descriptors (Web Animations API keyframes
// + options) for each named animation in design spec §6. Pure data (DOM *types* only, no DOM
// access) so both the WAAPI helpers and the React components consume the same definitions.
// Every variant animates `transform`/`opacity` only — never a layout property — to avoid jank.

import { DURATION, SCALE } from './tokens';
import { EASE } from './easings';

export interface MotionVariant {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
}

/** (1) Button / pressable — press-down scale. (Press is usually done via CSS; this is for JS callers.) */
export const pressVariant: MotionVariant = {
  keyframes: [{ transform: 'scale(1)' }, { transform: `scale(${SCALE.press})` }],
  options: { duration: DURATION.fast, easing: EASE.out, fill: 'none' },
};

/** (2) Chip / tab select — check pop (scale 0.95 → 1 with a small spring overshoot). */
export const popVariant: MotionVariant = {
  keyframes: [
    { transform: `scale(${SCALE.pressDeep})` },
    { transform: `scale(${SCALE.popOvershoot})`, offset: 0.7 },
    { transform: 'scale(1)' },
  ],
  options: { duration: DURATION.base, easing: EASE.spring, fill: 'none' },
};

/** (5) Promo / success — scale-in entrance. */
export const scaleInVariant: MotionVariant = {
  keyframes: [
    { transform: 'scale(0.92)', opacity: 0 },
    { transform: 'scale(1)', opacity: 1 },
  ],
  options: { duration: DURATION.base, easing: EASE.spring, fill: 'both' },
};

/** (5) Success check-circle spring. */
export const checkSpringVariant: MotionVariant = {
  keyframes: [
    { transform: 'scale(0)', opacity: 0 },
    { transform: `scale(${SCALE.popOvershoot})`, opacity: 1, offset: 0.6 },
    { transform: 'scale(1)', opacity: 1 },
  ],
  options: { duration: DURATION.slow, easing: EASE.spring, fill: 'both' },
};

/** (6) Add-to-cart — badge count pop. */
export const badgePopVariant: MotionVariant = {
  keyframes: [
    { transform: 'scale(0.6)' },
    { transform: `scale(${SCALE.popOvershoot})`, offset: 0.6 },
    { transform: 'scale(1)' },
  ],
  options: { duration: DURATION.fast, easing: EASE.spring, fill: 'none' },
};

/** (4) Bottom sheet slide-up / dismiss / scrim fade. */
export const sheetInVariant: MotionVariant = {
  keyframes: [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }],
  options: { duration: DURATION.sheet, easing: EASE.out, fill: 'both' },
};
export const sheetOutVariant: MotionVariant = {
  keyframes: [{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }],
  options: { duration: DURATION.base, easing: EASE.in, fill: 'both' },
};
export const scrimInVariant: MotionVariant = {
  keyframes: [{ opacity: 0 }, { opacity: 1 }],
  options: { duration: DURATION.sheet, easing: EASE.out, fill: 'both' },
};

/** (7) Stepper number tick — quick vertical roll + fade in the travel direction. */
export function tickVariant(direction: 'up' | 'down'): MotionVariant {
  const from = direction === 'up' ? 8 : -8;
  return {
    keyframes: [
      { transform: `translateY(${from}px)`, opacity: 0 },
      { transform: 'translateY(0)', opacity: 1 },
    ],
    options: { duration: DURATION.fast, easing: EASE.out, fill: 'none' },
  };
}

/**
 * (10) Horizontal slide-in (onboarding / generic content). Caller passes a SIGNED distance
 * (multiply the base distance by `useDirection().sign`) so the slide mirrors under `dir=rtl`.
 */
export function slideInVariant(signedDistancePx: number): MotionVariant {
  return {
    keyframes: [
      { transform: `translateX(${signedDistancePx}px)`, opacity: 0 },
      { transform: 'translateX(0)', opacity: 1 },
    ],
    options: { duration: DURATION.slow, easing: EASE.out, fill: 'both' },
  };
}
