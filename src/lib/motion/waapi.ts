// Web Animations API helpers. Self-contained (no new dependency): one-shot imperative animations
// run via `Element.animate(...)`. Every helper is no-op-safe — it degrades gracefully when the
// element is missing, WAAPI is unsupported, or the user prefers reduced motion. All animate
// `transform`/`opacity` only. No `'use client'` directive: these are plain functions (guarded for
// SSR) so the module is safe to import from server or client code.

import type { MotionVariant } from './variants';
import { EASE } from './easings';
import { DURATION, Z_FLOATING } from './tokens';

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

function reduceMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(REDUCED_QUERY).matches
  );
}

function supportsWAAPI(): boolean {
  return typeof Element !== 'undefined' && typeof Element.prototype.animate === 'function';
}

export interface AnimateOptions {
  /** Skip the animation when the user prefers reduced motion (default true — for delight motion). */
  respectReducedMotion?: boolean;
  /** Merge over the variant's options (e.g. `{ delay: 120 }`). */
  override?: Partial<KeyframeAnimationOptions>;
  /** Called when the animation finishes — and immediately when the animation is skipped. */
  onFinish?: () => void;
}

/**
 * Run a {@link MotionVariant} on an element. Returns the `Animation` handle (cancel it on unmount)
 * or `null` when skipped/unsupported. When skipped, `onFinish` still fires so callers can treat
 * "animation done" and "animation skipped" uniformly.
 */
export function animateVariant(
  el: Element | null | undefined,
  variant: MotionVariant,
  opts: AnimateOptions = {},
): Animation | null {
  const { respectReducedMotion = true, override, onFinish } = opts;
  if (!el || !supportsWAAPI() || (respectReducedMotion && reduceMotion())) {
    onFinish?.();
    return null;
  }
  const animation = el.animate(variant.keyframes, { ...variant.options, ...override });
  if (onFinish) animation.addEventListener('finish', onFinish, { once: true });
  return animation;
}

export interface FlyArcOptions {
  /** Element to fly (e.g. a clone of the product image). Defaults to a small brand dot. */
  ghost?: HTMLElement;
  durationMs?: number;
  /** Fires when the ghost reaches the cart — and immediately when the fly is skipped. */
  onArrive?: () => void;
}

/**
 * Add-to-cart "fly to cart": animate a ghost element along a quadratic arc from `fromEl` to
 * `toEl`. Direction-agnostic — it uses live bounding rects, so it mirrors correctly under RTL for
 * free. No-op (calls `onArrive` immediately) under reduced motion or when a target is missing,
 * so the caller can always pop the badge / increment the count regardless.
 */
