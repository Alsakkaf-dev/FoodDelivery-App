'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/icons';
import { IconButton, EmptyState } from '@/components/ui';
import { ProductGrid } from './product-grid';
import { CategorySelect } from './category-select';
import { FilterSheet } from '../filter-sheet';
import { EMPTY_FILTERS, applyFilters, matchesCategory, type Filters } from './filters';
import type { MenuItem } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// Category listing ("Food - Burgers"): header (back · category selector · search ·
// filter) + a 2-col product grid filtered by the selected brand bucket and the
// filter sheet. Single-shop honest binding — see ./filters. Search is a navigation
// anchor (dark circle), back/filter are real buttons. `arrow-left` auto-mirrors.
export function CategoryExperience({
  items,
  initialCategory,
  lang,
  t,
}: {
  items: MenuItem[];
  initialCategory: string;
  lang: 'en' | 'ar';
  t: Dictionary;
}) {
  const router = useRouter();
  const [category, setCategory] = useState(initialCategory);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);

  const results = useMemo(
    () => applyFilters(items.filter((m) => matchesCategory(m, category)), filters),
    [items, category, filters],
  );

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-2">
        <IconButton variant="nav" aria-label={t.back} onClick={() => router.back()}>
          <Icon name="arrow-left" aria-hidden />
        </IconButton>
        <div className="flex-1">
          <CategorySelect value={category} onSelect={setCategory} t={t} />
        </div>
        <Link
          href="/search"
          aria-label={t.search}
          className="grid min-h-tap min-w-tap place-items-center rounded-full bg-dark-cta text-onColor"
        >
          <Icon name="search" aria-hidden />
        </Link>
        <IconButton variant="nav" aria-label={t.filter_title} onClick={() => setFilterOpen(true)}>
          <Icon name="sliders" aria-hidden />
        </IconButton>
      </header>

      <h1 className="text-h1 font-bold text-ink">{t.popular}</h1>

      {results.length === 0 ? (
        <EmptyState title={t.no_results} />
      ) : (
        <ProductGrid items={results} lang={lang} subtitleFor={() => t.shop_name as string} />
      )}

      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        value={filters}
        onApply={setFilters}
        t={t}
      />
    </div>
  );
}
