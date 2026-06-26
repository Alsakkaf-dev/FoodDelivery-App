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

