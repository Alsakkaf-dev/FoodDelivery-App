'use client';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useShopStatus } from '@/lib/realtime/hooks';
import { StatusBadge, QtyCounter } from '@/components/ui/status';
import type { DailySession, ShopStatus } from '@/types/db';

/**
 * One tap = one shop transition (US-023 Open / US-024 Close / US-025 Sold-Out,
 * FR-O-01/02/03). Kept module-level + pure so the three transitions are
 * unit-testable without rendering the component.
 */
export type ShopActionKey = 'open' | 'close' | 'sold_out';
export const ACTION_RESULT: Record<ShopActionKey, ShopStatus> = {
  open: 'open',
  close: 'closed',
  sold_out: 'sold_out',
};

/** A server action invoked on tap; only its `ok` flag drives the UI. */
type ShopAction = () => Promise<{ ok: boolean }>;
type Labels = { open: string; close: string; soldOut: string; error: string };

/**
 * SCR-O-01 — one-tap Open / Close / Sold-Out island.
 * Optimistic: the tapped status shows immediately, then the server action runs;
 * on failure we roll back to the live status and surface an inline error.
 * `useShopStatus` keeps the badge + remaining counter live over the shop:status
 * channel, so the change propagates to every client (and back here) within ~2s
 * with no manual refresh (NFR-P-01). The server actions arrive as props so this
 * island stays free of server-only imports and is directly unit-testable.
 */
export function StateControls({
  initial,
  qtyTotal,
  lang,
  labels,
  onOpen,
  onClose,
  onSoldOut,
}: {
  initial: Pick<DailySession, 'status' | 'qty_remaining'>;
  qtyTotal: number;
  lang: 'en' | 'ar';
  labels: Labels;
  onOpen: ShopAction;
  onClose: ShopAction;
  onSoldOut: ShopAction;
}) {
  const router = useRouter();
  const live = useShopStatus(initial) ?? initial;
  const [optimistic, setOptimistic] = useState<ShopStatus | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, start] = useTransition();

  const status = optimistic ?? live.status;

  // Once realtime confirms the optimistic status, drop the local override.
  useEffect(() => {
    if (optimistic && live.status === optimistic) setOptimistic(null);
  }, [live.status, optimistic]);

  function run(target: ShopStatus, action: ShopAction) {
    setFailed(false);
    setOptimistic(target); // optimistic: show the new status at once
    start(async () => {
      const res = await action();
      if (!res.ok) {
        setOptimistic(null); // roll back to the live status
        setFailed(true);
      } else {
        router.refresh(); // refresh the server snapshot (orders count, etc.)
      }
    });
  }

  // h-16 = 64px → comfortably above the 44px tap-target minimum (D-15).
  const big = 'h-16 w-full text-lg';

  return (
    <section className="card space-y-4" data-shop-status={status}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-muted">
          {lang === 'ar' ? 'حالة المتجر' : 'Shop status'}
        </span>
        <StatusBadge status={status} lang={lang} />
      </div>

      {qtyTotal > 0 ? (
        <QtyCounter remaining={live.qty_remaining} total={qtyTotal} lang={lang} />
      ) : null}

      <div className="grid gap-3">
        <button
          type="button"
          className={`btn-open ${big}`}
          disabled={pending || status === 'open'}
          onClick={() => run(ACTION_RESULT.open, onOpen)}
        >
          {labels.open}
        </button>
        <button
          type="button"
          className={`btn-ghost ${big}`}
          disabled={pending || status === 'closed'}
          onClick={() => run(ACTION_RESULT.close, onClose)}
        >
          {labels.close}
        </button>
        <button
          type="button"
          className={`btn ${big} bg-soldout text-white`}
          disabled={pending || status === 'sold_out'}
          onClick={() => run(ACTION_RESULT.sold_out, onSoldOut)}
        >
          {labels.soldOut}
        </button>
      </div>

      {failed ? (
        <p role="alert" className="text-sm font-semibold text-soldout">
          {labels.error}
        </p>
      ) : null}
    </section>
  );
}
