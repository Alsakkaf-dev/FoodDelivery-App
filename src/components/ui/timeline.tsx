import type { OrderStatus } from '@/types/db';
import { cx } from './cx';

// CMP-U-13 — Order status timeline (FR-C-10). Cancelled is shown separately.
// Re-skinned (Plan 02): brand-orange completed nodes + connector, neutral pending.
// Exhaustive over OrderStatus; EN/AR labels preserved (ui-primitives.test.ts asserts them).
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
    return <p className="rounded-md bg-danger/10 p-3 font-semibold text-danger">{LABELS.cancelled[lang]}</p>;
  }
  const idx = FLOW.indexOf(status);
  return (
    <ol className="space-y-0">
      {FLOW.map((s, i) => {
        const done = i <= idx;
        const isLast = i === FLOW.length - 1;
        return (
          <li key={s} className="flex items-stretch gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cx(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                  done ? 'bg-brand text-onColor' : 'bg-surface-input text-muted',
                )}
              >
                {done ? '✓' : i + 1}
              </span>
              {!isLast ? <span className={cx('my-1 w-0.5 flex-1', i < idx ? 'bg-brand' : 'bg-line')} /> : null}
            </div>
            <span className={cx('pb-5 pt-1', done ? 'font-semibold text-ink' : 'text-muted')}>{LABELS[s][lang]}</span>
          </li>
        );
      })}
    </ol>
  );
}
