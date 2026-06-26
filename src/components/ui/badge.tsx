import { cx } from './cx';

// Plan 02 — Badge: small orange numeric count pill (cart badge #04, search/filters #08).
// Token-driven, copy-free. The consumer positions it (e.g. absolute start/end over a
// nav icon); the pill itself is symmetric so it mirrors cleanly under RTL.

export function Badge({
  count,
  max = 99,
  dot = false,
  showZero = false,
  className,
  'aria-label': ariaLabel,
}: {
  count?: number;
  max?: number;
  dot?: boolean;
  showZero?: boolean;
  className?: string;
  'aria-label'?: string;
}) {
  if (dot) {
    return <span className={cx('inline-block h-2.5 w-2.5 rounded-full bg-brand ring-2 ring-white', className)} aria-hidden />;
  }
  const n = count ?? 0;
  if (n <= 0 && !showZero) return null;
  const text = n > max ? `${max}+` : String(n);
  return (
    <span
      role="status"
      aria-label={ariaLabel ?? text}
      className={cx(
        'inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-pill bg-brand px-1.5 text-[11px] font-bold leading-none text-onColor ring-2 ring-white tabular-nums',
        className,
      )}
    >
      {text}
    </span>
  );
}
