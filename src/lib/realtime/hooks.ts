'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DailySession, Order, ShopStatus } from '@/types/db';

// Realtime channels (SDD §5.3). Each subscribes on mount, unsubscribes on unmount;
// a dropped socket degrades to the initial server-rendered value (NFR-R-04).

/** shop:status + shop:qty — live status & remaining quantity for all clients. */
export function useShopStatus(initial: Pick<DailySession, 'status' | 'qty_remaining'> | null) {
  const [state, setState] = useState(initial);
  useEffect(() => {
    const sb = createClient();
    const ch = sb
      .channel('shop:status')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'daily_session' }, (p) => {
        const row = p.new as DailySession;
        setState({ status: row.status as ShopStatus, qty_remaining: row.qty_remaining });
      })
      .subscribe();
    return () => {
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
    const ch = sb
      .channel('board:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (p) => {
        setOrders((prev) => {
          const row = p.new as Order;
          if (p.eventType === 'INSERT') return [row, ...prev];
          if (p.eventType === 'UPDATE') return prev.map((o) => (o.id === row.id ? row : o));
          return prev;
        });
      })
      .subscribe();
    return () => {
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
    const ch = sb
      .channel(`order:${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (p) => setOrder(p.new as Order),
      )
      .subscribe();
    return () => {
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
    const ch = sb
      .channel('rider:feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (p) => {
        const row = p.new as Order;
        setOrders((prev) => {
          const active = row.status === 'ready' || row.status === 'out_for_delivery';
          const without = prev.filter((o) => o.id !== row.id);
          return active ? [row, ...without] : without;
        });
      })
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, []);
  return orders;
}
