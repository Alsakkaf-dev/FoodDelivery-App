'use client';
// Motion primitives — the React layer of the Motion System (#18). Headless, composable wrappers
// and hooks that primitives (#02) and feature screens (#06–#17) import to apply the app's motion
// language WITHOUT forking. Engine is self-contained (Web Animations API + Tailwind `motion-reduce`
// utilities); values come from `@/lib/motion`. `prefers-reduced-motion` and RTL mirroring are baked
// in. Every animation is transform/opacity-only (no layout jank), and ≥44px tap targets are kept.
import {
  cloneElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  animateVariant,
  badgePopVariant,
  burstConfetti,
  checkSpringVariant,
  DISTANCE,
  DURATION,
  EASE,
  flyToCart,
  popVariant,
  scaleInVariant,
  slideInVariant,
  tickVariant,
  useDirection,
  useReducedMotion,
} from '@/lib/motion';

const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ');

/* ───────────────────────── (1) Button press ───────────────────────── */
/** Drop-in className for any pressable: darken (via your own active: colour) + 0.97 press scale. */
export const PRESS_CLASS =
  'transition-transform duration-150 ease-out active:scale-[.97] motion-reduce:transition-none motion-reduce:active:scale-100';

/** Wraps exactly one element child and merges {@link PRESS_CLASS} into its className. */
export function Pressable({
  children,
  className,
}: {
  children: ReactElement<{ className?: string }>;
  className?: string;
}) {
  return cloneElement(children, {
    className: cx(children.props.className, PRESS_CLASS, className),
  });
}

/* ─────────────────────── (2) Chip / tab select ─────────────────────── */
/** Colour crossfade for a chip/tab fill change. Pair with {@link useChipSelect} for the check pop. */
export const CROSSFADE_CLASS =
  'transition-colors duration-200 ease-out motion-reduce:transition-none';

/** Returns a ref to attach to a chip; pops it (scale 0.95→1 spring) when `selected` becomes true. */
export function useChipSelect<T extends HTMLElement = HTMLElement>(selected: boolean) {
  const ref = useRef<T>(null);
  const prev = useRef(selected);
  useEffect(() => {
    if (selected && !prev.current) animateVariant(ref.current, popVariant);
    prev.current = selected;
  }, [selected]);
  return ref;
}

/** Pops its children whenever `trigger` changes (skips the initial mount). */
export function Pop({
  trigger,
  children,
  className,
}: {
  trigger: unknown;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    animateVariant(ref.current, popVariant);
  }, [trigger]);
  return (
    <span ref={ref} className={cx('inline-flex', className)}>
      {children}
    </span>
  );
}

/* ─────────────────────── (3) Tab underline slide ───────────────────── */
/** A sliding underline that moves to the active segment. RTL-mirrored via the direction sign. */
export function TabUnderline({
  activeIndex,
  count,
  className,
}: {
  activeIndex: number;
  count: number;
  className?: string;
}) {
  const { sign } = useDirection();
  const widthPct = 100 / Math.max(1, count);
  const offsetPct = activeIndex * 100 * sign; // % of the underline's own width; flips for RTL
  return (
    <div className={cx('relative h-0.5 w-full', className)} aria-hidden>
      <span
        className="absolute top-0 h-0.5 rounded-pill bg-brand transition-transform duration-[250ms] ease-out motion-reduce:transition-none"
        style={{ width: `${widthPct}%`, insetInlineStart: 0, transform: `translateX(${offsetPct}%)` }}
      />
    </div>
  );
}

/* ──────────────────── (4) Bottom sheet slide + scrim ───────────────── */
