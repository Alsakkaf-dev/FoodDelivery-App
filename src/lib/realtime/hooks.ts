'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DailySession, Order, ShopStatus } from '@/types/db';

// Realtime channels (SDD §5.3, NFR-P-01). Each hook seeds from the server-rendered
// `initial` so a late joiner shows current truth immediately, subscribes for <2s
// live updates, and — if the socket drops — falls back to a periodic API re-fetch,
// resuming live updates on reconnect (NFR-R-04). Public signatures are unchanged.

// ── Pure merge helpers (unit-tested in tests/unit/realtime-merge.test.ts) ─────

/** Merge an order row into a board list. INSERT dedupes by id (a re-delivered
 *  INSERT updates the existing row instead of duplicating it). */
export function mergeOrder(prev: Order[], row: Order, eventType: string): Order[] {
  if (eventType === 'INSERT') {
    return prev.some((o) => o.id === row.id) ? prev.map((o) => (o.id === row.id ? row : o)) : [row, ...prev];
  }
  if (eventType === 'UPDATE') {
    return prev.map((o) => (o.id === row.id ? row : o));
  }
  return prev;
}

/** Merge an order into the rider feed: keep only ready/out-for-delivery, no dup. */
export function mergeRiderFeed(prev: Order[], row: Order): Order[] {
  const active = row.status === 'ready' || row.status === 'out_for_delivery';
  const without = prev.filter((o) => o.id !== row.id);
  return active ? [row, ...without] : without;
}

/** A channel status that means the socket dropped and we should poll. */
export function isDroppedStatus(status: string): boolean {
  return status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED';
}

// Shared poll controller: on a dropped status, periodically re-fetch the snapshot;
// stop once the channel is SUBSCRIBED again.
function makePoll(refetch: () => Promise<void>, intervalMs = 10_000) {
  let timer: ReturnType<typeof setInterval> | null = null;
  return {
    handle(status: string) {
      if (status === 'SUBSCRIBED') {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      } else if (isDroppedStatus(status) && timer === null) {
        timer = setInterval(() => {
          void refetch();
        }, intervalMs);
      }
    },
    stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    },
  };
}

async function getJson(url: string): Promise<{ ok: boolean; data?: unknown } | null> {
  try {
    return (await fetch(url, { cache: 'no-store' }).then((r) => r.json())) as { ok: boolean; data?: unknown };
  } catch {
    return null; // keep last known state
  }
}

/** shop:status + shop:qty — live status & remaining quantity for all clients. */
export function useShopStatus(initial: Pick<DailySession, 'status' | 'qty_remaining'> | null) {
  const [state, setState] = useState(initial);
  useEffect(() => {
    const sb = createClient();
    const poll = makePoll(async () => {
      const j = await getJson('/api/status');
      if (j?.ok) {
        const d = j.data as DailySession;
        setState({ status: d.status, qty_remaining: d.qty_remaining });
      }
    });
    const ch = sb
      .channel('shop:status')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'daily_session' }, (p) => {
        const row = p.new as DailySession;
        setState({ status: row.status as ShopStatus, qty_remaining: row.qty_remaining });
      })
      .subscribe((status) => poll.handle(status));
    return () => {
      poll.stop();
      sb.removeChannel(ch);
    };
  }, []);
  return state;
}

/** board:orders — live order board for the operator. */
export function useOrderBoard(initial: Order[]) {
  const [orders, setOrders] = useState<Order[]>(initial);
  useEffect(() => {
    const sb = createClient();
    const poll = makePoll(async () => {
      const j = await getJson('/api/board');
      if (j?.ok) setOrders((j.data as { orders: Order[] }).orders);
    });
    const ch = sb
      .channel('board:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (p) => {
        setOrders((prev) => mergeOrder(prev, p.new as Order, p.eventType));
      })
      .subscribe((status) => poll.handle(status));
    return () => {
      poll.stop();
      sb.removeChannel(ch);
    };
  }, []);
  return orders;
}

/** order:{id} — a single customer's order status. */
export function useOrderStatus(orderId: string, initial: Order) {
  const [order, setOrder] = useState<Order>(initial);
  useEffect(() => {
    const sb = createClient();
    const poll = makePoll(async () => {
      const j = await getJson(`/api/orders/${orderId}`);
      if (j?.ok) setOrder((j.data as { order: Order }).order);
    });
    const ch = sb
      .channel(`order:${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (p) => setOrder(p.new as Order),
      )
      .subscribe((status) => poll.handle(status));
    return () => {
      poll.stop();
      sb.removeChannel(ch);
    };
  }, [orderId]);
  return order;
}

/** rider:feed — orders becoming ready / out-for-delivery. */
export function useRiderFeed(initial: Order[]) {
  const [orders, setOrders] = useState<Order[]>(initial);
  useEffect(() => {
    const sb = createClient();
    const poll = makePoll(async () => {
      const j = await getJson('/api/rider/deliveries');
      if (j?.ok) {
        const grouped = j.data as Record<string, { order: Order }[]>;
        setOrders(Object.values(grouped).flat().map((d) => d.order));
      }
    });
    const ch = sb
      .channel('rider:feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (p) => {
        setOrders((prev) => mergeRiderFeed(prev, p.new as Order));
      })
      .subscribe((status) => poll.handle(status));
    return () => {
      poll.stop();
      sb.removeChannel(ch);
    };
  }, []);
  return orders;
}
