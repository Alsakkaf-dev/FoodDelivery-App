import type { ReactNode } from 'react';
import { cx } from './cx';

// Plan 02 — UnderlineTabs (2+ segments, orange text + underline on the active tab) and
// CarouselDots. Per-tab bottom-border underline mirrors cleanly under RTL (no transform
// math). UnderlineTabs supports controlled (value/onChange) and link (href) modes.

export type TabItem = { key: string; label: ReactNode; href?: string };

export function UnderlineTabs({
  tabs, value, onChange, className,
}: {
  tabs: TabItem[];
  value: string;
  onChange?: (key: string) => void;
  className?: string;
}) {
  return (
    <div role="tablist" className={cx('flex border-b border-line', className)}>
      {tabs.map((t) => {
        const active = t.key === value;
        const cls = cx(
          'relative -mb-px min-h-tap flex-1 border-b-2 px-4 py-3 text-center text-sm font-bold transition-colors motion-reduce:transition-none',
          active ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink',
        );
        if (t.href) {
          return (
            <a key={t.key} role="tab" aria-selected={active} href={t.href} className={cls}>{t.label}</a>
          );
        }
        return (
          <button key={t.key} type="button" role="tab" aria-selected={active} onClick={() => onChange?.(t.key)} className={cls}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export function CarouselDots({
  count, index, onDotClick, label = 'carousel', className,
}: {
  count: number;
  index: number;
  onDotClick?: (i: number) => void;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cx('flex items-center justify-center gap-2', className)} role="tablist" aria-label={label}>
      {Array.from({ length: count }).map((_, i) => {
        const active = i === index;
        const dot = <span className={cx('h-2 rounded-pill transition-all motion-reduce:transition-none', active ? 'w-5 bg-brand' : 'w-2 bg-line')} />;
        if (onDotClick) {
          return (
            <button key={i} type="button" role="tab" aria-selected={active} aria-label={`${i + 1}`} onClick={() => onDotClick(i)} className="flex min-h-tap min-w-tap items-center justify-center">
              {dot}
            </button>
          );
        }
        return <span key={i} aria-hidden>{dot}</span>;
      })}
    </div>
  );
}
