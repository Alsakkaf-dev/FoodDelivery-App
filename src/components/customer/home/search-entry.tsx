import Link from 'next/link';
import { Icon } from '@/components/icons';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// SCR-C-01 — Home search entry pill. Presentational entry point only (not a live
// input); routes to the Search surface (#08). Filled gray pill per the design.
export function SearchEntry({ t }: { t: Dictionary }) {
  return (
    <Link
      href="/search"
      aria-label={t.home_search_placeholder}
      className="flex min-h-[52px] items-center gap-3 rounded-pill bg-surface-input px-4 text-muted"
    >
      <Icon name="search" className="shrink-0" aria-hidden />
      <span className="truncate">{t.home_search_placeholder}</span>
    </Link>
  );
}
