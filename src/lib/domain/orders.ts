'use server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole, getProfile, RoleError } from '@/lib/auth/roles';
import { ok, fail, type ApiResult } from '@/lib/utils/api';
import { createOrderSchema, advanceOrderSchema } from '@/lib/utils/schemas';
import { canTransition, type Order, type OrderItem, type OrderStatus } from '@/types/db';
import { dispatchOrderEvent } from '@/lib/notifications/dispatch';
import { STATUS_EVENT } from '@/lib/notifications/templates';

const PG_CODE: Record<string, string> = {
  shop_not_open: 'shop_not_open',
  past_cutoff: 'past_cutoff',
  sold_out_or_insufficient: 'sold_out_or_insufficient',
  delivery_requires_zone_address: 'delivery_requires_zone_address',
  item_unavailable: 'item_unavailable',
  empty_cart: 'empty_cart',
};

/** Place an order via the race-safe RPC, then fire EVT-01 (SDD §5.1). */
export async function createOrder(input: unknown): Promise<ApiResult<{ order_id: string; order_no: string; sold_out: boolean }>> {
  try {
    const me = await requireRole('customer');
    const parsed = createOrderSchema.safeParse(input);
    if (!parsed.success) return fail('validation_error', 'Invalid order', parsed.error.flatten());
    const v = parsed.data;
    const sb = createClient();
    const { data, error } = await sb.rpc('place_order', {
      p_customer: me.id,
      p_type: v.type,
      p_zone: v.zone_id ?? null,
      p_address: v.address_id ?? null,
      p_payment_method: v.payment_method,
      p_proof: v.proof_url ?? null,
      p_items: v.items,
    });
    if (error) {
      const code = PG_CODE[error.message] ?? 'conflict';
      return fail(code, error.message);
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return fail('conflict', 'Order could not be placed.');

    // EVT-01 order_received (deduped at the DB; service-role dispatch)
    await dispatchOrderEvent({
      orderId: row.order_id, userId: me.id, phone: me.phone, lang: me.lang,
      event: 'order_received', vars: { name: me.name ?? '', order_no: row.order_no },
    });
    return ok({ order_id: row.order_id, order_no: row.order_no, sold_out: row.sold_out });
  } catch (e) {
    return e instanceof RoleError ? fail(e.code, e.code) : fail('internal', e instanceof Error ? e.message : 'error');
  }
}

export async function getOrder(id: string): Promise<ApiResult<{ order: Order; items: OrderItem[] }>> {
  const sb = createClient();
  const { data: order } = await sb.from('orders').select('*').eq('id', id).maybeSingle();
  if (!order) return fail('not_found', 'Order not found');
  const { data: items } = await sb.from('order_items').select('*').eq('order_id', id);
  return ok({ order: order as Order, items: (items as OrderItem[]) ?? [] });
}

export async function listMyOrders(): Promise<ApiResult<Order[]>> {
  try {
    const me = await requireRole('customer');
    const sb = createClient();
    const { data } = await sb.from('orders').select('*').eq('customer_id', me.id).order('created_at', { ascending: false });
    return ok((data as Order[]) ?? []);
  } catch (e) {
    return e instanceof RoleError ? fail(e.code, e.code) : fail('internal', 'error');
  }
}

export async function cancelOrder(id: string, reason?: string): Promise<ApiResult<true>> {
  try {
    const me = await requireRole('customer');
    const sb = createClient();
    const { data: order } = await sb.from('orders').select('*').eq('id', id).maybeSingle();
    if (!order) return fail('not_found', 'Order not found');
    if (!['new', 'confirmed'].includes((order as Order).status)) return fail('conflict', 'Too late to cancel.');
    const { error } = await sb.from('orders').update({ status: 'cancelled', cancel_reason: reason ?? 'Cancelled by customer' }).eq('id', id);
    if (error) return fail('forbidden', error.message);
    await fireStatusEvent(id, 'cancelled', { reason: reason ?? '' });
    return ok(true);
  } catch (e) {
    return e instanceof RoleError ? fail(e.code, e.code) : fail('internal', 'error');
  }
}

/** Operator board: today's orders with their lines. */
export async function boardList(): Promise<ApiResult<{ orders: Order[] }>> {
  try {
    await requireRole('operator');
    const sb = createClient();
    const { data } = await sb.from('orders').select('*').order('created_at', { ascending: false });
    return ok({ orders: (data as Order[]) ?? [] });
  } catch (e) {
    return e instanceof RoleError ? fail(e.code, e.code) : fail('internal', 'error');
  }
}

/** Advance an order one legal step and notify the customer (FR-O-10). */
export async function advanceOrder(input: unknown): Promise<ApiResult<Order>> {
  try {
    await requireRole('operator');
    const parsed = advanceOrderSchema.safeParse(input);
    if (!parsed.success) return fail('validation_error', 'Invalid transition', parsed.error.flatten());
    const sb = createClient();
    const { data: cur } = await sb.from('orders').select('*').eq('id', parsed.data.id).maybeSingle();
    if (!cur) return fail('not_found', 'Order not found');
    const from = (cur as Order).status;
    const to = parsed.data.to_status as OrderStatus;
    if (!canTransition(from, to)) return fail('invalid_transition', `Cannot move ${from} → ${to}`);
    const { data, error } = await sb.from('orders').update({ status: to }).eq('id', parsed.data.id).select('*').single();
    if (error) return fail('conflict', error.message);
    await fireStatusEvent(parsed.data.id, to);
    return ok(data as Order);
  } catch (e) {
    return e instanceof RoleError ? fail(e.code, e.code) : fail('internal', 'error');
  }
}

export async function dispatchOrder(id: string): Promise<ApiResult<Order>> {
  return advanceOrder({ id, to_status: 'out_for_delivery' });
}

export async function verifyPayment(id: string, decision: 'verified' | 'rejected'): Promise<ApiResult<true>> {
  try {
    await requireRole('operator');
    const sb = createClient();
    const { error } = await sb.from('orders').update({ payment_status: decision }).eq('id', id);
    if (error) return fail('not_found', error.message);
    return ok(true);
  } catch (e) {
    return e instanceof RoleError ? fail(e.code, e.code) : fail('internal', 'error');
  }
}

export async function refuseOrder(id: string, reason: string): Promise<ApiResult<true>> {
  try {
    await requireRole('operator');
    const sb = createClient();
    const { data: cur } = await sb.from('orders').select('status').eq('id', id).maybeSingle();
    if (!cur) return fail('not_found', 'Order not found');
    if (!['new', 'confirmed'].includes((cur as { status: string }).status)) return fail('conflict', 'Only New/Confirmed can be refused.');
    const { error } = await sb.from('orders').update({ status: 'cancelled', cancel_reason: reason }).eq('id', id);
    if (error) return fail('conflict', error.message);
    await fireStatusEvent(id, 'cancelled', { reason });
    return ok(true);
  } catch (e) {
    return e instanceof RoleError ? fail(e.code, e.code) : fail('internal', 'error');
  }
}

/** End-of-day summary (FR-O-13). */
export async function endOfDay(): Promise<ApiResult<{ orders: number; items_sold: number; revenue: number }>> {
  try {
    await requireRole('operator');
    const sb = createClient();
    const { data } = await sb.from('orders').select('item_count,total,status');
    const rows = (data as Pick<Order, 'item_count' | 'total' | 'status'>[]) ?? [];
    const completed = rows.filter((r) => r.status === 'delivered');
    return ok({
      orders: completed.length,
      items_sold: completed.reduce((t, r) => t + r.item_count, 0),
      revenue: completed.reduce((t, r) => t + Number(r.total), 0),
    });
  } catch (e) {
    return e instanceof RoleError ? fail(e.code, e.code) : fail('internal', 'error');
  }
}

// Fire the notification for a status using the order's customer (service role).
async function fireStatusEvent(orderId: string, status: OrderStatus, extra: Record<string, string> = {}) {
  const event = STATUS_EVENT[status];
  if (!event) return;
  const db = createAdminClient();
  const { data: order } = await db.from('orders').select('order_no, customer_id, session_id').eq('id', orderId).single();
  if (!order) return;
  const { data: cust } = await db.from('users').select('phone, lang, name').eq('id', order.customer_id).single();
  if (!cust) return;
  const { data: session } = await db.from('daily_session').select('delivery_window').eq('id', order.session_id).single();
  await dispatchOrderEvent({
    orderId, userId: order.customer_id, phone: cust.phone, lang: cust.lang,
    event,
    vars: { name: cust.name ?? '', order_no: order.order_no, window: session?.delivery_window ?? '', ...extra },
  });
}
