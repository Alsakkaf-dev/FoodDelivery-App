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
