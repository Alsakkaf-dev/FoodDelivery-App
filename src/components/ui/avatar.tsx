import type { ReactNode } from 'react';
import { Icon } from '@/components/icons';
import { cx } from './cx';

// Plan 02 — Avatar: photo (CSS background-image, per spec — no remote next/image) or
// initials fallback, with optional peach backdrop, presence dot, and an edit-FAB slot.
// Presence dot / edit-FAB sit at the logical bottom-end so they mirror under RTL.

const SIZE = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-14 w-14 text-base',
  lg: 'h-20 w-20 text-h2',
  xl: 'h-28 w-28 text-h1',
} as const;

function initialsOf(name?: string) {
  if (!name) return '';
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export function Avatar({
  src, name, alt, size = 'md', presence, backdrop, editAction, className,
}: {
  src?: string;
  name?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  presence?: 'online' | 'offline';
  backdrop?: boolean;
  editAction?: ReactNode;
  className?: string;
}) {
  const initials = initialsOf(name);
  return (
    <span className={cx('relative inline-flex items-center justify-center', className)}>
      {backdrop ? <span className="absolute inset-0 -z-[1] scale-110 rounded-full bg-brand-tint" aria-hidden /> : null}
      <span className={cx('inline-flex items-center justify-center overflow-hidden rounded-full bg-surface-input font-bold text-ink', SIZE[size])}>
        {src ? (
          <span
            role="img"
            aria-label={alt ?? name ?? ''}
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url("${src}")` }}
          />
        ) : initials ? (
          <span aria-hidden>{initials}</span>
        ) : (
          <Icon name="user" className="h-1/2 w-1/2 text-muted" aria-hidden />
        )}
      </span>
      {presence ? (
        <span
          className={cx('absolute bottom-0 end-0 h-3.5 w-3.5 rounded-full ring-2 ring-white', presence === 'online' ? 'bg-success' : 'bg-muted')}
          aria-hidden
        />
      ) : null}
      {editAction ? <span className="absolute bottom-0 end-0">{editAction}</span> : null}
    </span>
  );
}
