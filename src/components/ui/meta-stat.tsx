import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/components/icons';
import { cx } from './cx';

// Plan 02 — MetaStat: the inline "★ 4.7 · 🚚 Free · 🕐 20 min" row (orange line icons).
// Renders nothing when there are no items (per contract). Token-driven, copy-agnostic,
// RTL-safe (flex row mirrors; icons are non-directional). Star tone uses the star token.

export type MetaItem = { icon: IconName; label: ReactNode; tone?: 'brand' | 'muted' | 'star' };

const TONE = { brand: 'text-brand', muted: 'text-muted', star: 'text-star' } as const;

export function MetaStat({ items, className }: { items?: MetaItem[]; className?: string }) {
  if (!items || items.length === 0) return null;
  return (
    <div className={cx('flex flex-wrap items-center gap-x-5 gap-y-2', className)}>
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Icon name={it.icon} className={cx('h-4 w-4', TONE[it.tone ?? 'brand'])} aria-hidden />
          <span>{it.label}</span>
        </span>
      ))}
    </div>
  );
}
