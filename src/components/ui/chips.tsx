import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from '@/components/icons';
import { cx } from './cx';

// Plan 02 — Chips / pills / selectable tiles. Outline ↔ filled-orange is the shared
// selection language across categories, filter pills, $ toggles, sizes, restaurant
// tabs and payment/address tiles. Token-driven, ≥44px tap, RTL-safe (logical props;
// directional icons auto-mirror). Isomorphic (no hooks) — handlers come from props.

/**
 * Chip / Pill — outline by default, filled-orange when `selected`. Works as a toggle
 * (`onToggle`) or, with a `role`, as a tab/radio segment (caller drives aria state).
 */
export function Chip({
  selected, onToggle, leadingIcon, disabled, className, children, ...rest
}: {
  selected?: boolean;
  onToggle?: (next: boolean) => void;
  leadingIcon?: IconName;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onToggle'>) {
  return (
    <button
      type="button"
      aria-pressed={onToggle ? !!selected : undefined}
      onClick={(e) => { onToggle?.(!selected); rest.onClick?.(e); }}
      disabled={disabled}
      className={cx(
        'inline-flex min-h-tap items-center gap-2 rounded-pill border px-4 text-sm font-semibold transition active:scale-95 motion-reduce:transition-none disabled:opacity-50',
        selected ? 'border-brand bg-brand text-onColor' : 'border-line bg-white text-body hover:border-brand/40',
        className,
      )}
      {...rest}
    >
      {leadingIcon ? <Icon name={leadingIcon} className="h-4 w-4" aria-hidden /> : null}
      {children}
    </button>
  );
}
export const Pill = Chip;

/** SelectChip — circular gray↔orange toggle (sizes 10"/14"/16", $ / $$ / $$$). */
export function SelectChip({
  selected, onToggle, disabled, className, children, ...rest
}: {
  selected?: boolean;
  onToggle?: (next: boolean) => void;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onToggle'>) {
  return (
    <button
      type="button"
      aria-pressed={onToggle ? !!selected : undefined}
      onClick={(e) => { onToggle?.(!selected); rest.onClick?.(e); }}
      disabled={disabled}
      className={cx(
        'flex min-h-tap min-w-tap items-center justify-center rounded-full px-3 text-sm font-bold transition active:scale-95 motion-reduce:transition-none disabled:opacity-50',
        selected ? 'bg-brand text-onColor shadow-floating' : 'bg-surface-input text-body hover:bg-brand-tint',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/**
 * SelectTile — full-width selectable row (payment method, address, fulfilment).
 * Orange border + check badge when selected. `role="radio"` by default; pass your own
 * for checkbox semantics. Leading slot holds a logo/icon; text starts (RTL-safe).
 */
export function SelectTile({
  selected, onSelect, title, subtitle, leading, trailing, disabled, role = 'radio', className,
}: {
  selected?: boolean;
  onSelect?: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  disabled?: boolean;
  role?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onSelect}
      disabled={disabled}
      className={cx(
        'flex w-full items-center gap-3 rounded-lg border-2 p-4 text-start transition disabled:opacity-50',
        selected ? 'border-brand bg-brand-faint' : 'border-line bg-white hover:border-brand/40',
        className,
      )}
    >
      {leading ? <span className="shrink-0">{leading}</span> : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-title font-bold text-ink">{title}</span>
        {subtitle ? <span className="block truncate text-caption text-muted">{subtitle}</span> : null}
      </span>
      {trailing}
      <span
        className={cx(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
          selected ? 'border-brand bg-brand text-onColor' : 'border-line',
        )}
        aria-hidden
      >
        {selected ? <Icon name="check" className="h-3 w-3" /> : null}
      </span>
    </button>
  );
}

/** CategoryChip — icon over label; active state = gradient disc + floating glow. */
