import type { ReactNode } from 'react';
import { Icon } from '@/components/icons';
import { cx } from './cx';

// Plan 02 — ListRow / SettingsRow: leading IconChip slot + title/subtitle + trailing
// value/chevron. Renders as <a>, <button> or <div> depending on props. The chevron uses
// the directional `chevron-right` icon which auto-mirrors under RTL. Optional selectable
// mode (orange-faint + check). Token-driven, ≥44px tap.

export function ListRow({
  leading, title, subtitle, value, trailing, href, onClick, chevron = true,
  selected, selectable, disabled, className,
}: {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  value?: ReactNode;
  trailing?: ReactNode;
  href?: string;
  onClick?: () => void;
  chevron?: boolean;
  selected?: boolean;
  selectable?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const cls = cx(
    'flex w-full min-h-tap items-center gap-3 rounded-lg p-3 text-start transition',
    selected ? 'bg-brand-faint' : 'hover:bg-surface-alt',
    disabled && 'pointer-events-none opacity-50',
    className,
  );
  const showChevron = chevron && !selectable && (href || onClick);

  const inner = (
    <>
      {leading ? <span className="shrink-0">{leading}</span> : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-title font-semibold text-ink">{title}</span>
        {subtitle ? <span className="block truncate text-caption text-muted">{subtitle}</span> : null}
      </span>
      {value !== undefined && value !== null ? <span className="shrink-0 text-sm font-medium text-muted">{value}</span> : null}
      {trailing}
      {selectable ? (
        <span
          className={cx('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2', selected ? 'border-brand bg-brand text-onColor' : 'border-line')}
          aria-hidden
        >
          {selected ? <Icon name="check" className="h-3 w-3" /> : null}
        </span>
      ) : null}
      {showChevron ? <Icon name="chevron-right" className="h-5 w-5 shrink-0 text-muted" aria-hidden /> : null}
    </>
  );

  if (href) return <a href={href} className={cls}>{inner}</a>;
  if (onClick) {
    return (
      <button type="button" onClick={onClick} disabled={disabled} aria-pressed={selectable ? !!selected : undefined} className={cls}>
        {inner}
      </button>
    );
  }
  return <div className={cls}>{inner}</div>;
}

/** SettingsRow — same row, named for settings/account menus (composes ListRow). */
export const SettingsRow = ListRow;
