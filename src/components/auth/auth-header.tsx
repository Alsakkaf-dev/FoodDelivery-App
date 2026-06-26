// Dark-navy hero header for the auth shell (Log In / Sign Up / Forgot / Verification).
// Sunburst pinned top-START + dashed curve top-END so both mirror automatically under
// dir=rtl; optional back button (start) + language toggle (end). Server component —
// no state. Tokens/brand-art/primitives consumed by name (#01/#05/#02), never redefined.
import { Sunburst, DashedCurve } from '@/components/brand'; // AWAITING #05: confirm export names
import { LangToggle } from '@/components/ui';
import type { Locale } from '@/lib/i18n/config';
import { BackButton } from './back-button';

export function AuthHeader({
  title,
  subtitle,
  locale,
  showBack = false,
  backLabel,
}: {
  title: string;
  subtitle?: string;
  locale: Locale;
  showBack?: boolean;
  backLabel?: string;
}) {
  return (
    <header className="relative isolate overflow-hidden bg-ink-header px-6 pb-14 pt-14 text-center">
      {/* Brand texture — decorative, behind the content layer */}
      <Sunburst aria-hidden className="pointer-events-none absolute start-0 top-0 z-0 h-40 w-40 opacity-80" />
      <DashedCurve aria-hidden className="pointer-events-none absolute end-0 top-0 z-0 h-28 w-28 opacity-40" />

      <div className="relative z-10">
        {showBack ? (
          <BackButton label={backLabel ?? 'Back'} className="absolute -top-3 start-0" />
        ) : null}
        <div className="absolute -top-3 end-0">
          <LangToggle current={locale} />
        </div>
        <h1 className="pt-8 text-h1 font-bold text-onColor">{title}</h1>
        {subtitle ? <p className="mt-1 text-body text-onColor/70">{subtitle}</p> : null}
      </div>
    </header>
  );
}
