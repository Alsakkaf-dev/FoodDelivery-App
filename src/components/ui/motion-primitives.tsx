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
export const SHEET_SURFACE_CLASS =
  'transition-transform duration-[280ms] ease-out will-change-transform motion-reduce:transition-none data-[state=closed]:translate-y-full data-[state=open]:translate-y-0';
export const SHEET_SCRIM_CLASS =
  'transition-opacity duration-[280ms] ease-out motion-reduce:transition-none data-[state=closed]:opacity-0 data-[state=open]:opacity-100';

/**
 * Drives a bottom-sheet enter/exit. Returns `mounted` (keep the node rendered while it animates
 * out) and `state` ('open'|'closed') to feed `SheetMotion`/`Scrim` (or your own `data-state` node).
 */
export function useSheetTransition(open: boolean): { mounted: boolean; state: 'open' | 'closed' } {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(open);
  const [state, setState] = useState<'open' | 'closed'>(open ? 'open' : 'closed');
  useEffect(() => {
    if (open) {
      setMounted(true);
      // Two rAFs so the browser paints the closed state before flipping to open (the transition runs).
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setState('open'));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    setState('closed');
    if (reduced) {
      setMounted(false);
      return;
    }
    const t = window.setTimeout(() => setMounted(false), DURATION.base);
    return () => window.clearTimeout(t);
  }, [open, reduced]);
  return { mounted, state };
}

/** Sheet surface wrapper (slides up from the bottom). Compose your grabber/CTA inside. */
export function SheetMotion({
  state,
  className,
  children,
}: {
  state: 'open' | 'closed';
  className?: string;
  children: ReactNode;
}) {
  return (
    <div data-state={state} className={cx(SHEET_SURFACE_CLASS, className)}>
      {children}
    </div>
  );
}

/** Scrim/overlay that fades with the sheet. Absolutely positioned in the sheet's portal/container. */
export function Scrim({
  state,
  onClick,
  className,
}: {
  state: 'open' | 'closed';
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      data-state={state}
      onClick={onClick}
      className={cx('absolute inset-0 bg-ink/40', SHEET_SCRIM_CLASS, className)}
      aria-hidden
    />
  );
}

/* ─────────────────── (5) Promo / success + confetti ────────────────── */
/** Scale-in entrance for promo/success cards. */
export function ScaleIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    animateVariant(ref.current, scaleInVariant, { override: { delay } });
  }, [delay]);
  return (
    <div ref={ref} className={className} style={{ opacity: reduced ? 1 : 0 }}>
      {children}
    </div>
  );
}

/** Check-circle spring (wrap a check/check-circle icon). */
export function SuccessCheck({ children, className }: { children?: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    animateVariant(ref.current, checkSpringVariant);
  }, []);
  return (
    <span ref={ref} className={cx('inline-flex', className)} style={{ opacity: reduced ? 1 : 0 }}>
      {children}
    </span>
  );
}

/** Confetti burst (SUCCESS only — spec §6 palette). Render inside a `relative` container. */
export function Confetti({
  fire = true,
  count,
  className,
}: {
  fire?: boolean;
  count?: number;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!fire) return;
    return burstConfetti(host.current, count !== undefined ? { count } : undefined);
  }, [fire, count]);
  return (
    <div
      ref={host}
      className={cx('pointer-events-none absolute inset-0 overflow-visible', className)}
      aria-hidden
    />
  );
}

/* ────────────────── (6) Add-to-cart fly + badge pop ────────────────── */
/** Pops its children whenever `count` increases (badge count bump). */
export function BadgePop({
  count,
  children,
  className,
}: {
  count: number;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(count);
  useEffect(() => {
    if (count > prev.current) animateVariant(ref.current, badgePopVariant);
    prev.current = count;
  }, [count]);
  return (
    <span ref={ref} className={cx('inline-flex', className)}>
      {children}
    </span>
  );
}

/**
 * Returns a `fly(from, to, onArrive?)` callback that arcs a ghost from a source element (e.g. the
 * product image) to the cart. No-op under reduced motion — `onArrive` still fires so you can bump
 * the badge regardless. Mirrors under RTL automatically (uses live element rects).
 */
export function useFlyToCart() {
  return useCallback((from: Element | null, to: Element | null, onArrive?: () => void) => {
    flyToCart(from, to, onArrive ? { onArrive } : undefined);
  }, []);
}

/* ───────────────────────── (7) Stepper tick ────────────────────────── */
/** Renders a number and rolls it (up/down) when the value changes. Compose ± with `Pressable`. */
export function TickNumber({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  useEffect(() => {
    if (value !== prev.current) {
      animateVariant(ref.current, tickVariant(value > prev.current ? 'up' : 'down'));
      prev.current = value;
    }
  }, [value]);
  return (
    <span ref={ref} className={cx('inline-block tabular-nums', className)}>
      {value}
    </span>
  );
}

/* ─────────────────── (8) Live-tracking pulse rings ─────────────────── */
/** Concentric rings that pulse outward (loop) behind a destination pin. Static when reduced. */
export function PulseRings({
  rings = 3,
  size = 80,
  color = 'bg-brand/30',
  className,
}: {
  rings?: number;
  size?: number;
  color?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduced) return;
    const host = hostRef.current;
    if (!host || typeof Element.prototype.animate !== 'function') return;
    const anims = Array.from(host.children).map((ring, i) =>
      ring.animate(
        [
          { transform: 'scale(0.4)', opacity: 0.6 },
          { transform: 'scale(1)', opacity: 0 },
        ],
        {
          duration: DURATION.pulse,
          easing: EASE.out,
          iterations: Infinity,
          delay: (i * DURATION.pulse) / Math.max(1, rings),
        },
      ),
    );
    return () => anims.forEach((a) => a.cancel());
  }, [reduced, rings]);
  return (
    <div
      ref={hostRef}
      className={cx('pointer-events-none relative', className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {Array.from({ length: rings }).map((_, i) => (
        <span
          key={i}
          className={cx('absolute inset-0 rounded-full', color)}
          style={{ opacity: reduced ? 0.25 : 0 }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── (9) Splash sequence ─────────────────────── */
/** Orchestrated splash: doodle fade → logo reveal → sunburst sweep → `onComplete`. */
export function SplashSequence({
  doodle,
  logo,
  sunburst,
  onComplete,
  className,
}: {
  doodle?: ReactNode;
  logo?: ReactNode;
  sunburst?: ReactNode;
  onComplete?: () => void;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const doodleRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const sunburstRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduced) {
      const t = window.setTimeout(() => onCompleteRef.current?.(), 600);
      return () => window.clearTimeout(t);
    }
    animateVariant(doodleRef.current, {
      keyframes: [{ opacity: 0 }, { opacity: 1 }],
      options: { duration: 400, easing: EASE.out, fill: 'both' },
    });
    animateVariant(logoRef.current, {
      keyframes: [
        { opacity: 0, transform: 'scale(0.9)' },
        { opacity: 1, transform: 'scale(1)' },
      ],
      options: { duration: 500, delay: 300, easing: EASE.spring, fill: 'both' },
    });
    animateVariant(sunburstRef.current, {
      keyframes: [
        { opacity: 0, transform: 'rotate(-20deg) scale(0.8)' },
        { opacity: 1, transform: 'rotate(0deg) scale(1)' },
      ],
      options: { duration: 700, delay: 700, easing: EASE.out, fill: 'both' },
    });
    const t = window.setTimeout(() => onCompleteRef.current?.(), DURATION.splash);
    return () => window.clearTimeout(t);
  }, [reduced]);
  const initial = reduced ? 1 : 0;
  return (
    <div className={cx('relative h-full w-full', className)}>
      <div ref={sunburstRef} className="absolute inset-0 grid place-items-center" style={{ opacity: initial }} aria-hidden>
        {sunburst}
      </div>
      <div ref={doodleRef} className="absolute inset-0" style={{ opacity: initial }} aria-hidden>
        {doodle}
      </div>
      <div ref={logoRef} className="relative grid h-full place-items-center" style={{ opacity: initial }}>
        {logo}
      </div>
    </div>
  );
}
