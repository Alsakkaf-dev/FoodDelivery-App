import Link from 'next/link';
import { FoodImage } from '@/components/ui/food-image';
import { StatusBadge, QtyCounter } from '@/components/ui/status';
import { MetaStat } from '@/components/ui';
import { Icon } from '@/components/icons';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { ShopStatus } from '@/types/db';

// SCR-C-01 — Open-Restaurants hero (Home V). The single Fahman vendor rendered as
// the canonical restaurant card: hero photo + name + live status + MetaStat row.
// Presentational only — `status-hero.tsx` owns the live useShopStatus wiring and
// feeds the live values down (seed shapes preserved). The card pattern is reused
// by #08 (Search/Categories). Live-data first: the design's ★ rating slot carries
// the real shop status instead of a fabricated number (no ratings in the schema).
type Props = {
  status: ShopStatus;
  qtyRemaining: number;
  qtyTotal: number;
  deliveryWindow: string | null;
  photoUrl?: string | null;
  lang: 'en' | 'ar';
  t: Dictionary;
};

export function RestaurantHeroCard({
  status,
  qtyRemaining,
  qtyTotal,
  deliveryWindow,
  photoUrl,
  lang,
  t,
}: Props) {
  const isOpen = status === 'open';
  // MetaStat is built from REAL data only: free delivery (brand-static) + the live
  // delivery window when configured. No fake rating/fixed-time is invented.
  const meta = [
    { icon: 'truck' as const, label: t.meta_free_delivery },
    ...(deliveryWindow ? [{ icon: 'clock' as const, label: deliveryWindow }] : []),
  ];

  return (
    <Link
      href="/menu"
      aria-label={`${t.shop_name} — ${t.browse_menu}`}
      className={`card block space-y-3 ${isOpen ? '' : 'opacity-90'}`}
    >
      <div className="relative">
        <FoodImage shape="hero" src={photoUrl ?? undefined} alt={t.shop_name} className="h-44 w-full" />
        {/* Live status overlay chip (mirrors at dir=rtl via logical inset). */}
        <span className="absolute start-3 top-3">
          <StatusBadge status={status} lang={lang} />
        </span>
      </div>

      <div className="flex items-start justify-between gap-2">
        <h3 className="text-title text-ink">{t.shop_name}</h3>
        <Icon name="chevron-right" className="mt-1 shrink-0 text-muted" aria-hidden />
      </div>

      <MetaStat items={meta} />

      {isOpen && qtyTotal > 0 ? (
        <QtyCounter remaining={qtyRemaining} total={qtyTotal} lang={lang} />
      ) : (
        <p className="text-body">
          {status === 'sold_out' ? t.sold_out_msg : t.shop_closed_msg}
        </p>
      )}
    </Link>
  );
}
