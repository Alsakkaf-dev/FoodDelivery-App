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

