import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/components/icons';
import { cx } from './cx';

// Plan 02 — IconChip (white circle + tinted glyph) and IconTile (peach circle + caption).
// IconChip powers the profile/notification/address rows (orange/blue/purple/green/red
// glyphs); IconTile powers the Food-Details ingredient row. Token-driven, RTL-safe.

type IconChipTone = 'brand' | 'info.blue' | 'info.purple' | 'success' | 'danger';

const TONE: Record<IconChipTone, string> = {
  brand: 'text-brand',
  'info.blue': 'text-info-blue',
  'info.purple': 'text-info-purple',
  success: 'text-success',
  danger: 'text-danger',
};

export function IconChip({
  icon, tone = 'brand', size = 'md', filled = false, className,
}: {
  icon: IconName;
  tone?: IconChipTone;
  size?: 'sm' | 'md' | 'lg';
  filled?: boolean;
  className?: string;
}) {
  const dim = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';
  const glyph = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';
  return (
    <span
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-full',
        filled ? 'bg-brand-tint' : 'bg-white ring-1 ring-line',
        dim,
        TONE[tone],
        className,
      )}
      aria-hidden
    >
      <Icon name={icon} className={glyph} />
    </span>
  );
}

export function IconTile({
  icon, caption, subCaption, className,
}: {
  icon: IconName;
  caption?: ReactNode;
  subCaption?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('flex flex-col items-center gap-1 text-center', className)}>
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-tint text-brand" aria-hidden>
        <Icon name={icon} className="h-6 w-6" />
      </span>
      {caption ? <span className="text-caption font-semibold text-ink">{caption}</span> : null}
      {subCaption ? <span className="text-caption text-muted">{subCaption}</span> : null}
    </div>
  );
}
