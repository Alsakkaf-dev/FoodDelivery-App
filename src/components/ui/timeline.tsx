import type { OrderStatus } from '@/types/db';

// CMP-U-13 — Order status timeline (FR-C-10). Cancelled is shown separately.
const FLOW: OrderStatus[] = ['new', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
const LABELS: Record<OrderStatus, { en: string; ar: string }> = {
  new: { en: 'Order received', ar: 'تم استلام الطلب' },
  confirmed: { en: 'Confirmed', ar: 'تم التأكيد' },
  preparing: { en: 'Preparing', ar: 'قيد التحضير' },
  ready: { en: 'Ready', ar: 'جاهز' },
  out_for_delivery: { en: 'On the way', ar: 'في الطريق' },
  delivered: { en: 'Delivered', ar: 'تم التوصيل' },
  cancelled: { en: 'Cancelled', ar: 'ملغى' },
};

export function Timeline({ status, lang = 'en' }: { status: OrderStatus; lang?: 'en' | 'ar' }) {
  if (status === 'cancelled') {
    return <p className="rounded-control bg-muted/10 p-3 text-muted">{LABELS.cancelled[lang]}</p>;
  }
  const idx = FLOW.indexOf(status);
  return (
    <ol className="space-y-3">
      {FLOW.map((s, i) => {
        const done = i <= idx;
        return (
          <li key={s} className="flex items-center gap-3">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${done ? 'bg-rust text-white' : 'bg-cream text-muted'}`}>
              {done ? '✓' : i + 1}
            </span>
            <span className={done ? 'font-semibold text-slate' : 'text-muted'}>{LABELS[s][lang]}</span>
          </li>
        );
      })}
    </ol>
  );
}
