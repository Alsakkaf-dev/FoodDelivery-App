import type { CSSProperties } from 'react';

// Brand texture kit (Plan 05 · design-spec §7). Decorative layers applied
// SPARINGLY to hero / empty / success surfaces. All are aria-hidden and
// pointer-events-none; colours are baked to the spec palette inside the
// /public/textures SVGs (assets can't read Tailwind tokens — documented in
// brand/README.md). Position/size via `className` from the consuming screen.

type TextureProps = { className?: string };

function bgImage(src: string): CSSProperties {
  return { backgroundImage: `url(${src})` };
}

/** Amber→orange ray fan. Place behind a hero/splash logo (e.g. absolute top). */
export function Sunburst({ className }: TextureProps) {
  return (
    <span
      aria-hidden
      style={bgImage('/textures/sunburst.svg')}
      className={`pointer-events-none block bg-contain bg-top bg-no-repeat ${className ?? ''}`}
    />
  );
}

/** Faint dashed flourish curve. */
export function DashedCurve({ className }: TextureProps) {
  return (
    <span
      aria-hidden
      style={bgImage('/textures/dashed-curve.svg')}
      className={`pointer-events-none block bg-contain bg-center bg-no-repeat ${className ?? ''}`}
    />
  );
}

/** Organic peach blob backdrop (onboarding characters, avatar halos). */
export function PeachBlob({ className }: TextureProps) {
  return (
    <span
      aria-hidden
      style={bgImage('/textures/peach-blob.svg')}
      className={`pointer-events-none block bg-contain bg-center bg-no-repeat ${className ?? ''}`}
    />
  );
}

/**
 * Tiled cream food-doodle watermark. Fills its nearest positioned ancestor
 * (`absolute inset-0`) at 7% opacity (spec: 6–10%). Wrap the host in `relative`.
 */
export function FoodDoodles({ className }: TextureProps) {
  return (
    <span
      aria-hidden
      style={{
        backgroundImage: 'url(/textures/food-doodle.svg)',
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
      }}
      className={`pointer-events-none absolute inset-0 opacity-[0.07] ${className ?? ''}`}
    />
  );
}

/**
 * Celebratory confetti burst — celebratory states ONLY (success/payment), per
 * spec. Inline SVG so Plan 18 can animate it; confetti palette (lavender /
 * yellow / peach + brand) is a fixed art constant, not a design token.
 */
export function Confetti({ className }: TextureProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 220"
      fill="none"
      aria-hidden="true"
      className={`pointer-events-none ${className ?? ''}`}
    >
      <path d="M58 34l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7Z" fill="#B7A6E0"/>
      <path d="M256 44l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7Z" fill="#FFD23F"/>
      <path d="M150 18l2.2 4.6 5 .6-3.6 3.5 1 4.9-4.6-2.4-4.6 2.4 1-4.9-3.6-3.5 5-.6Z" fill="#F5811F"/>
      <path d="M210 150l2.2 4.6 5 .6-3.6 3.5 1 4.9-4.6-2.4-4.6 2.4 1-4.9-3.6-3.5 5-.6Z" fill="#FBC7A4"/>
      <path d="M96 168l2.2 4.6 5 .6-3.6 3.5 1 4.9-4.6-2.4-4.6 2.4 1-4.9-3.6-3.5 5-.6Z" fill="#7C5CFC"/>
      <circle cx="34" cy="120" r="4.5" fill="#FFD23F"/>
      <circle cx="288" cy="120" r="4.5" fill="#B7A6E0"/>
      <circle cx="120" cy="92" r="3.5" fill="#FBC7A4"/>
      <circle cx="196" cy="78" r="3.5" fill="#F5811F"/>
      <circle cx="160" cy="196" r="4" fill="#FFD23F"/>
      <path d="M40 70c7 5-7 9 0 15" stroke="#7C5CFC" stroke-width="3" stroke-linecap="round"/>
      <path d="M278 74c7 5-7 9 0 15" stroke="#F5811F" stroke-width="3" stroke-linecap="round"/>
      <rect x="232" y="186" width="9" height="9" rx="2" fill="#B7A6E0" transform="rotate(24 236 190)"/>
      <rect x="78" y="40" width="9" height="9" rx="2" fill="#FBC7A4" transform="rotate(-18 82 44)"/>
    </svg>
  );
}
