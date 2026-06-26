// Fahman logo lockup (Plan 05 · design-spec §7) — navy ink wordmark + orange
// food-cloche mark. Token-driven (`fill-brand`/`stroke-brand`/`text-ink`,
// Plan 01) — no hardcoded hex. The wordmark is a brand name, so it stays LTR
// even under dir=rtl (the lockup itself is marked dir="ltr").

type LogoVariant = 'wordmark' | 'mark';

interface LogoProps {
  /** `wordmark` = cloche + text (default); `mark` = cloche glyph only. */
  variant?: LogoVariant;
  /** Mark height in px (the wordmark text scales from it). Default 32. */
  size?: number;
  className?: string;
  /** Wordmark text. Default 'Fahman' (brand name — not translated). */
  label?: string;
  /** Accessible name. Defaults to `label`; pass '' to render decorative. */
  title?: string;
}

function ClocheMark({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="32" cy="13" r="3" className="fill-brand" />
      <path d="M32 16v3.5" className="stroke-brand" strokeWidth="3" strokeLinecap="round" />
      <path d="M11 45a21 21 0 0 1 42 0Z" className="fill-brand" />
      <rect x="7" y="45" width="50" height="6" rx="3" className="fill-brand" />
    </svg>
  );
}

export function Logo({
  variant = 'wordmark',
  size = 32,
  className,
  label = 'Fahman',
  title,
}: LogoProps) {
  const name = title ?? label;
  const a11y = name
    ? { role: 'img' as const, 'aria-label': name }
    : { 'aria-hidden': true };

  if (variant === 'mark') {
    return (
      <span {...a11y} className={`inline-flex ${className ?? ''}`}>
        <ClocheMark size={size} />
      </span>
    );
  }
  return (
    <span
      {...a11y}
      dir="ltr"
      className={`inline-flex items-center gap-1.5 ${className ?? ''}`}
    >
      <ClocheMark size={size} />
      <span
        aria-hidden
        className="font-sans font-extrabold lowercase tracking-tight text-ink"
        style={{ fontSize: Math.round(size * 0.7) }}
      >
        {label}
      </span>
    </span>
  );
}
