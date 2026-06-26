'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { cancelOrder } from '@/lib/domain/orders';
import type { OrderStatus } from '@/types/db';
import { BottomSheet } from '@/components/ui';
import { ReviewComposer, type ReviewComposerLabels } from './review-composer';

// Engineer #13 — the interactive row actions for an order (client island).
// Ongoing → Track (Link → live tracking) + Cancel (server action, confirm sheet).
// History → Rate (optimistic review composer) + Re-Order (→ /menu, v1).
// Buttons use the contracted `.btn-*` classes (FOUNDATION_CONTRACTS §1e, re-skinned
// by #01) on the semantically-correct element; structural pieces (BottomSheet,
// RatingRow) come from the #02 primitive library. No frozen contract is touched —
// cancelOrder lives in the 'use server' domain module and is consumed read-only.

export type OrderActionLabels = {
  track: string;
  cancel: string;
  rate: string;
  reorder: string;
  confirmTitle: string;
  keep: string;
  confirmCancel: string;
  tooLate: string;
  error: string;
  composer: ReviewComposerLabels;
};

// Only these states may be cancelled by the customer (mirrors the domain guard in
// cancelOrder); for every other ongoing state we hide Cancel and let Track span.
const CANCELLABLE: OrderStatus[] = ['new', 'confirmed'];

type Props = {
  orderId: string;
  orderNo: string;
  status: OrderStatus;
  variant: 'ongoing' | 'history';
  shopName: string;
  labels: OrderActionLabels;
};

export function OrderActions({ orderId, orderNo, status, variant, shopName, labels }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function doCancel() {
    setError(null);
    startTransition(async () => {
      const res = await cancelOrder(orderId);
      if (res.ok) {
        setConfirmOpen(false);
        router.refresh();
      } else {
        // 'conflict' = the order advanced past the cancel window between render and tap.
        setError(res.error.code === 'conflict' ? labels.tooLate : labels.error);
      }
    });
  }

  if (variant === 'history') {
    return (
      <>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" className="btn-secondary min-h-tap" onClick={() => setReviewOpen(true)}>
            {labels.rate}
          </button>
          <Link href="/menu" className="btn-primary min-h-tap">
            {labels.reorder}
          </Link>
        </div>
        <ReviewComposer
          open={reviewOpen}
          onClose={() => setReviewOpen(false)}
          orderNo={orderNo}
          shopName={shopName}
          labels={labels.composer}
        />
      </>
    );
  }

  const canCancel = CANCELLABLE.includes(status);

  return (
    <>
      <div className={canCancel ? 'grid grid-cols-2 gap-3' : 'grid'}>
        <Link href={`/orders/${orderId}`} className="btn-primary min-h-tap">
          {labels.track}
        </Link>
        {canCancel ? (
          <button type="button" className="btn-secondary min-h-tap" onClick={() => setConfirmOpen(true)}>
            {labels.cancel}
          </button>
        ) : null}
      </div>

      <BottomSheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={labels.confirmTitle}
        closeLabel={labels.keep}
      >
        {error ? (
          <p className="mb-2 text-caption text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="btn-secondary min-h-tap"
            onClick={() => setConfirmOpen(false)}
            disabled={pending}
          >
            {labels.keep}
          </button>
          <button
            type="button"
            className="btn-primary min-h-tap !bg-danger"
            onClick={doCancel}
            disabled={pending}
          >
            {labels.confirmCancel}
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
