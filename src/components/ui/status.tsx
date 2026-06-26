import type { OrderStatus, ShopStatus } from '@/types/db';
import { cx } from './cx';

// CMP-U-01 — Shop status badge. Re-skinned to the new palette (Plan 02):
// open → success green, sold_out → warning amber, closed → neutral muted.
// EN/AR label strings are the canonical source of truth (Integration Contract §A4)
// and are preserved exactly — ui-primitives.test.ts asserts them.
const SHOP: Record<ShopStatus, { cls: string; en: string; ar: string; dot: string }> = {
  open: { cls: 'bg-success/10 text-success', en: 'Open', ar: 'مفتوح', dot: 'bg-success' },
  closed: { cls: 'bg-surface-alt text-muted', en: 'Closed', ar: 'مغلق', dot: 'bg-muted' },
  sold_out: { cls: 'bg-warning/10 text-warning', en: 'Sold out', ar: 'نفدت الكمية', dot: 'bg-warning' },
};
export function StatusBadge({ status, lang = 'en' }: { status: ShopStatus; lang?: 'en' | 'ar' }) {
  const s = SHOP[status];
  return (
    <span className={cx('badge', s.cls)}>
      <span className={cx('h-2 w-2 rounded-full', s.dot)} aria-hidden />
      {lang === 'ar' ? s.ar : s.en}
    </span>
  );
}

// CMP-U-03 — Live remaining-quantity counter (FR-C-03). Track + fill re-skinned to
// brand orange on the new surface-input track; keeps role="progressbar" + aria values.
export function QtyCounter({ remaining, total, lang = 'en' }: { remaining: number; total: number; lang?: 'en' | 'ar' }) {
  const pct = total > 0 ? Math.round((remaining / total) * 100) : 0;
  const label = lang === 'ar' ? `بقي ${remaining} حصة` : `${remaining} portions left`;
  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-body text-sm font-semibold">
        <span>{lang === 'ar' ? 'المتبقي اليوم' : 'Remaining today'}</span>
        <span className={remaining === 0 ? 'text-danger' : 'text-brand'}>{label}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-pill bg-surface-input" role="progressbar" aria-valuenow={remaining} aria-valuemax={total}>
        <div className="h-full rounded-pill bg-brand transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// CMP-U-02 — Order status chip. Active states → brand orange, done → success green,
// cancelled → danger red, new → neutral. Exhaustive over OrderStatus; EN/AR preserved.
