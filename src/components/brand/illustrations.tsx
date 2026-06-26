// Brand illustration components (Plan 05 · design-spec §7). Flat-vector,
// friendly art consumed by onboarding (#06), success/tracking (#12), payment
// (#11), empty/error states (#02 EmptyState/ErrorState `illustration` slot),
// and location access (#06). All are COPY-FREE — the consuming screen owns the
// AR/EN text (dict keys, #03); these only render the picture.
//
// Multi-colour art lives as optimized SVGs in /public/illustrations (lazy,
// no-CLS via intrinsic width/height). SuccessLite is inline so it can be
// token-coloured (Plan 01) and animated (Plan 18). Decorative (aria-hidden) by
// default; pass `title` to expose an accessible name.

type IllustrationProps = {
  className?: string;
  /** Accessible name. Omitted = decorative (aria-hidden). */
  title?: string;
};

function Art({
  src,
  w,
  h,
  className,
  title,
}: { src: string; w: number; h: number } & IllustrationProps) {
  const labelled = typeof title === 'string' && title.length > 0;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- local static SVG, CSS background-image pattern (no next/image remote config, per spec §7)
    <img
      src={src}
      alt={labelled ? title : ''}
      aria-hidden={labelled ? undefined : true}
      width={w}
      height={h}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`inline-block h-auto max-w-full select-none ${className ?? ''}`}
    />
  );
}

const ONBOARDING_SRC: Record<1 | 2 | 3 | 4, string> = {
  1: '/illustrations/onboarding-1.svg',
  2: '/illustrations/onboarding-2.svg',
  3: '/illustrations/onboarding-3.svg',
  4: '/illustrations/onboarding-4.svg',
};

