'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/icons';
import { IconButton, EmptyState } from '@/components/ui';
import { CartBadge } from '@/components/ui/cart-badge';
import { SearchBar } from './search-bar';
import { RecentKeywords } from './recent-keywords';
import { SuggestedList } from './suggested-list';
import { ProductGrid } from './product-grid';
import { useRecentSearches } from './use-recent-searches';
import type { MenuItem } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// Search screen orchestrator. Header (back · "Search" · cart-with-count) + the
// search field. While typing it live-filters the REAL menu by bilingual name;
// when empty it shows recent keywords + suggested rows + a popular grid. The cart
// affordance is #04's shared inline CartBadge (hydration-safe, hidden at 0); #04
// hides the shell's floating instance on /search so they don't double up.
// `arrow-left` auto-mirrors under dir=rtl.
const POPULAR_LIMIT = 6;
const SUGGESTED_LIMIT = 3;

export function SearchExperience({
  items,
  lang,
  t,
}: {
  items: MenuItem[];
  lang: 'en' | 'ar';
  t: Dictionary;
}) {
  const router = useRouter();
  const { recent, push, clear } = useRecentSearches();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return [];
    return items.filter(
      (m) => m.name_en.toLowerCase().includes(q) || m.name_ar.toLowerCase().includes(q),
    );
  }, [items, q]);

  const popular = useMemo(
    () => [...items].sort((a, b) => a.sort_order - b.sort_order).slice(0, POPULAR_LIMIT),
    [items],
  );
  const vendor = () => t.shop_name as string;

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <IconButton variant="nav" aria-label={t.back} onClick={() => router.back()}>
          <Icon name="arrow-left" aria-hidden />
        </IconButton>
        <h1 className="flex-1 text-h1 font-bold text-ink">{t.search}</h1>
        <CartBadge openLabel={t.cart_open} countLabel={t.cart_items_count} />
      </header>

      <SearchBar value={query} onChange={setQuery} onSubmit={push} lang={lang} t={t} autoFocus />

      {q ? (
        results.length === 0 ? (
          <EmptyState title={t.no_results} />
        ) : (
          <ProductGrid items={results} lang={lang} subtitleFor={vendor} />
        )
      ) : (
        <>
          <RecentKeywords items={recent} onPick={(kw) => setQuery(kw)} onClear={clear} t={t} />
          <SuggestedList items={popular.slice(0, SUGGESTED_LIMIT)} lang={lang} t={t} />
          <section aria-labelledby="popular-h" className="space-y-3">
            <h2 id="popular-h" className="text-h2 font-bold text-ink">
              {t.popular}
            </h2>
            <ProductGrid items={popular} lang={lang} subtitleFor={vendor} />
          </section>
        </>
      )}
    </div>
  );
}
