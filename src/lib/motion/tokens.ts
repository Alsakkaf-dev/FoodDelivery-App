// Motion design tokens — the single source of truth for the app's motion *values*.
// Owned by the Motion System (#18). These are NOT Tailwind design tokens (#01 owns colours/
// radii/shadows); they are the timing/scale vocabulary the whole app animates with, distilled
// from the design spec §6: "150–250ms ease-out". Pure constants — no DOM, no React — so this
// file is safe to import from anywhere (server or client).

/** Durations in milliseconds. The 150–250ms band is the canonical range for state changes. */
export const DURATION = {
  instant: 0,
  fast: 150, // micro-interactions: button press, badge pop, number tick
  base: 200, // default: chip fill, scale-in, sheet-out
  slow: 250, // larger travel: underline slide, onboarding slide
  sheet: 280, // bottom-sheet slide-up (longest single travel, just past the band)
  pulse: 2000, // live-tracking concentric ring loop period
  splash: 1800, // full splash sequence (doodle → logo → sunburst)
} as const;

/** Delays in milliseconds. */
export const DELAY = {
  none: 0,
  stagger: 60, // per-item stagger for sequenced reveals
} as const;

/** Transform scale constants. */
export const SCALE = {
  press: 0.97, // button / pressable press-down
  pressDeep: 0.95, // chip / select pop start
  popOvershoot: 1.06, // spring overshoot peak (success check, badge, add-to-cart)
} as const;

/** Distances in pixels. */
export const DISTANCE = {
  slide: 32, // horizontal content slide-in (onboarding, generic) — sign-flipped under RTL
} as const;

/**
 * Confetti palette — design spec §6: celebratory SUCCESS states ONLY (lavender, yellow, peach).
 * Kept here (not as a Tailwind token) because it is motion-system delight vocabulary, not a
 * themeable surface colour. If #01 ever tokenises these, the Motion System switches to them.
 */
export const CONFETTI_COLORS = ['#B7A6E0', '#FFD23F', '#FFC4A3'] as const;

/**
 * z-index for transient motion artefacts (the fly-to-cart ghost). Stays within the ≤40 floating
 * band so it never overlaps the frozen z-stack: OfflineBanner(50) / InstallPrompt(60).
 */
export const Z_FLOATING = 40;
