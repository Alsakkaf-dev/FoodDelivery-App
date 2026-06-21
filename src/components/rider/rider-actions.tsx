'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { OrderStatus } from '@/types/db';
import { riderPickup, riderDeliver } from '@/lib/domain/rider';

/**
 * CMP-R-02 — The rider's primary action button (FR-R-05/06).
 * "Picked up" shows while status='ready'; "Delivered" while status='out_for_delivery'.
 * After a successful action we return to the deliveries list.
 */
export function RiderActions({
  orderId,
  status,
  pickedUpLabel,
  deliveredLabel,
  errorLabel,
}: {
  orderId: string;
  status: OrderStatus;
  pickedUpLabel: string;
  deliveredLabel: string;
  errorLabel: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function run(action: (id: string) => Promise<{ ok: boolean }>) {
    setBusy(true);
    setError('');
    action(orderId)
      .then((res) => {
        if (!res.ok) {
          setBusy(false);
          setError(errorLabel);
          return;
        }
        start(() => {
          router.push('/rider');
          router.refresh();
        });
      })
      .catch(() => {
        setBusy(false);
        setError(errorLabel);
      });
  }

  const disabled = busy || pending;

  if (status !== 'ready' && status !== 'out_for_delivery') return null;

  return (
    <div className="space-y-2">
      {status === 'ready' ? (
        <button
          className="btn-primary h-16 w-full text-lg"
          disabled={disabled}
          onClick={() => run(riderPickup)}
        >
          {disabled ? '…' : `✅ ${pickedUpLabel}`}
        </button>
      ) : (
        <button
          className="btn-open h-16 w-full text-lg"
          disabled={disabled}
          onClick={() => run(riderDeliver)}
        >
          {disabled ? '…' : `🏁 ${deliveredLabel}`}
        </button>
      )}
      {error ? (
        <p className="rounded-control bg-rust/10 p-3 text-center text-sm text-rust" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
