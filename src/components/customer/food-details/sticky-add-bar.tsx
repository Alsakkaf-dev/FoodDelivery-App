import { AddToCart } from '@/components/customer/add-to-cart';
import { formatMYR } from '@/lib/utils/money';
import type { MenuItem } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// Bottom add-bar — the dish unit price (display token) on the start side + the add
// control on the end side, presented as a sheet-styled panel (`shadow-sheet`,
// `rounded-t-2xl`). It is a composed token container, NOT the modal BottomSheet
// primitive, because the bar is always visible; it also avoids overlapping the shell's
// fixed BottomNav (it flows at the end of the page, which the shell's bottom padding
// clears). Server component: the price is server-rendered; only AddToCart is the client
// island, so the frozen useCart contract stays isolated and untouched.
export function StickyAddBar({
  item,
  lang,
  t,
}: {
  item: MenuItem;
  lang: 'en' | 'ar';
  t: Dictionary;
}) {
  return (
    <div className="-mx-4 rounded-t-2xl bg-surface px-4 pb-4 pt-4 shadow-sheet">
      <div className="flex items-center justify-between gap-4">
        <span className="text-display text-ink">{formatMYR(item.price, lang)}</span>
        {item.available ? (
          <AddToCart item={item} lang={lang} t={t} className="flex-1" />
        ) : (
          <span className="badge bg-surface-alt text-muted">{t.currently_unavailable}</span>
        )}
      </div>
    </div>
  );
}
