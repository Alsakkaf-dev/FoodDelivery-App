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

export function OnboardingIllustration({
  step,
  className,
  title,
}: { step: 1 | 2 | 3 | 4 } & IllustrationProps) {
  return <Art src={ONBOARDING_SRC[step]} w={240} h={240} className={className} title={title} />;
}

export function MapIllustration({ className, title }: IllustrationProps) {
  return <Art src="/illustrations/map.svg" w={200} h={200} className={className} title={title} />;
}

/** Rich payment-success art (wallet + coins). Pair with <Confetti/>. */
export function SuccessWallet({ className, title }: IllustrationProps) {
  return <Art src="/illustrations/success-wallet.svg" w={240} h={200} className={className} title={title} />;
}

export function CreditCardIllustration({ className, title }: IllustrationProps) {
  return <Art src="/illustrations/credit-card.svg" w={240} h={150} className={className} title={title} />;
}

type EmptyVariant = 'cart' | 'orders' | 'search' | 'menu' | 'zones' | 'generic';

const EMPTY_SRC: Record<EmptyVariant, string> = {
  cart: '/illustrations/empty-cart.svg',
  orders: '/illustrations/empty-orders.svg',
  search: '/illustrations/empty-search.svg',
  menu: '/illustrations/empty-menu.svg',
  zones: '/illustrations/empty-zones.svg',
  generic: '/illustrations/empty-menu.svg',
};

export function EmptyIllustration({
  variant = 'generic',
  className,
  title,
}: { variant?: EmptyVariant } & IllustrationProps) {
  return <Art src={EMPTY_SRC[variant]} w={200} h={160} className={className} title={title} />;
}

export function ErrorIllustration({ className, title }: IllustrationProps) {
  return <Art src="/illustrations/error.svg" w={200} h={160} className={className} title={title} />;
}

/**
 * Lite success tier — token-coloured check-circle + sparkles (design-spec §7;
 * matches the "Withdraw Successful" board). Inline so it picks up brand colour
 * and Plan 18 can spring/animate it. Disc + sparkles use Plan 01 tokens; the
 * check uses `stroke-onColor` (white-on-brand).
 */
