// Public API of the Motion System (#18). Import values/variants/helpers/hooks from here:
//   import { DURATION, EASE, animateVariant, useReducedMotion } from '@/lib/motion';
// React COMPONENTS (Pressable, ScaleIn, Confetti, PulseRings, …) live in
//   '@/components/ui/motion-primitives'.
//
// Note: the hooks (`useReducedMotion`, `useDirection`) are client-only ('use client'); the rest
// (tokens, easings, variants, waapi, confetti) are framework-agnostic and SSR-safe.

export * from './tokens';
export * from './easings';
export * from './variants';
export * from './waapi';
export * from './confetti';
export * from './use-reduced-motion';
export * from './use-direction';
