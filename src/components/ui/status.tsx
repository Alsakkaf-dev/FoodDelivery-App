import type { OrderStatus, ShopStatus } from '@/types/db';

// CMP-U-01 — Shop status badge.
const SHOP: Record<ShopStatus, { cls: string; en: string; ar: string; dot: string }> = {
  open: { cls: 'bg-open/10 text-open', en: 'Open', ar: 'مفتوح', dot: 'bg-open' },
  closed: { cls: 'bg-muted/10 text-muted', en: 'Closed', ar: 'مغلق', dot: 'bg-muted' },
  sold_out: { cls: 'bg-soldout/10 text-soldout', en: 'Sold out', ar: 'نفدت الكمية', dot: 'bg-soldout' },
};
export function StatusBadge({ status, lang = 'en' }: { status: ShopStatus; lang?: 'en' | 'ar' }) {
  const s = SHOP[status];
  return (
    <span className={`badge ${s.cls}`}>
      <span className={`h-2 w-2 rounded-full ${s.dot}`} aria-hidden />
      {lang === 'ar' ? s.ar : s.en}
    </span>
  );
}

// CMP-U-03 — Live remaining-quantity counter (FR-C-03).
export function QtyCounter({ remaining, total, lang = 'en' }: { remaining: number; total: number; lang?: 'en' | 'ar' }) {
  const pct = total > 0 ? Math.round((remaining / total) * 100) : 0;
  const label = lang === 'ar' ? `بقي ${remaining} حصة` : `${remaining} portions left`;
  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-sm font-semibold text-slate">
        <span>{lang === 'ar' ? 'المتبقي اليوم' : 'Remaining today'}</span>
        <span className={remaining === 0 ? 'text-soldout' : 'text-rust'}>{label}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-cream" role="progressbar" aria-valuenow={remaining} aria-valuemax={total}>
        <div className="h-full rounded-full bg-rust transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// CMP-U-02 — Order status chip.
const ORDER: Record<OrderStatus, { cls: string; en: string; ar: string }> = {
  new: { cls: 'bg-cream text-slate', en: 'New', ar: 'جديد' },
  confirmed: { cls: 'bg-rust/10 text-rust', en: 'Confirmed', ar: 'مؤكد' },
  preparing: { cls: 'bg-rust/10 text-rust', en: 'Preparing', ar: 'قيد التحضير' },
  ready: { cls: 'bg-open/10 text-open', en: 'Ready', ar: 'جاهز' },
  out_for_delivery: { cls: 'bg-open/10 text-open', en: 'On the way', ar: 'في الطريق' },
  delivered: { cls: 'bg-open/15 text-open', en: 'Delivered', ar: 'تم التوصيل' },
  cancelled: { cls: 'bg-muted/15 text-muted', en: 'Cancelled', ar: 'ملغى' },
};
export function OrderStatusChip({ status, lang = 'en' }: { status: OrderStatus; lang?: 'en' | 'ar' }) {
  const s = ORDER[status];
  return <span className={`badge ${s.cls}`}>{lang === 'ar' ? s.ar : s.en}</span>;
}
