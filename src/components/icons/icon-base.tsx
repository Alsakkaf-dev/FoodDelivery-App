import type { ReactNode, SVGProps } from 'react';

// Foundation icon shell (Plan 05 · design-spec §7 "thin 1.5–2px rounded-stroke
// line icons"). Every named glyph composes <IconBase> so sizing, stroke, a11y
// and RTL-mirroring behave identically across the whole set.
//
// Colour comes from `currentColor` — NEVER hardcode a hex. Consumers set the
// colour with a Tailwind token text-* class on the icon or an ancestor
// (`text-brand` active/brand, `text-muted` neutral, `text-ink` headings,
// `text-star` ratings, `text-danger` destructive). This keeps the set fully
// token-driven (Plan 01) without redefining a single token here.

/** Props every icon accepts (spread straight onto the <svg>). */
export type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {
  /** Width AND height (px number, or any CSS length). Default 24. */
  size?: number | string;
  /** Stroke width — 1.5–2 per spec §7. Default 1.75. */
  strokeWidth?: number;
  /**
   * Accessible name. When set, the icon is exposed to assistive tech
   * (`role="img"` + `<title>`). When omitted, the icon is decorative
   * (`aria-hidden`) — correct when an adjacent text label already names the
   * control (most nav/list/button usages).
   */
  title?: string;
};

type IconBaseProps = IconProps & {
  children: ReactNode;
  /** Directional glyphs (back/forward/send) flip horizontally under dir=rtl. */
  mirror?: boolean;
  /** Paint via fill instead of stroke (filled star/heart/pins, brand marks). */
  filled?: boolean;
};

/**
 * Internal <svg> wrapper. Not a glyph on its own — exported only so the
 * category files (nav/actions/meta/social/food) can build on it.
 */
