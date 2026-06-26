'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Order } from '@/types/db';
import { Icon } from '@/components/icons';
import { useRiderFeed } from '@/lib/realtime/hooks';

/**
 * CMP-R-03 — Live deliveries feed (SDD §5.3, rider:feed).
 * Seeds useRiderFeed with the server-rendered orders; when the live set of
 * ready / out-for-delivery orders changes, it surfaces a one-tap refresh so the
 * rider always sees the latest assignments without a manual reload (NFR-R-04:
 * a dropped socket simply degrades to the static server render).
 *
 * Feed-diff + hook usage are FROZEN logic — only the button presentation is restyled.
 * Keeps `sticky top-2 z-30` (z-stack: feed-seed 30 < BottomNav 40 < OfflineBanner 50).
 */
export function RiderFeedSeed({
  initial,
  refreshLabel,
}: {
  initial: Order[];
  refreshLabel: string;
}) {
  const router = useRouter();
  const live = useRiderFeed(initial);
  const baselineIds = useRef(new Set(initial.map((o) => o.id)));
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    const liveIds = new Set(live.map((o) => o.id));
    const added = live.some((o) => !baselineIds.current.has(o.id));
    const removed = [...baselineIds.current].some((id) => !liveIds.has(id));
    setChanged(added || removed);
  }, [live]);

  if (!changed) return null;

  return (
    <button
      className="btn-primary sticky top-2 z-30 inline-flex w-full items-center justify-center gap-2"
      onClick={() => {
        baselineIds.current = new Set(live.map((o) => o.id));
        setChanged(false);
        router.refresh();
      }}
    >
      <Icon name="refresh" className="h-4 w-4" aria-hidden />
      {refreshLabel}
    </button>
  );
}
