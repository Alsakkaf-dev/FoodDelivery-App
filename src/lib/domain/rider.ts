'use server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole, RoleError } from '@/lib/auth/roles';
import { ok, fail, type ApiResult } from '@/lib/utils/api';
import { advanceOrder } from './orders';
import type { Order } from '@/types/db';

export interface RiderDelivery {
  order: Order;
  zone_name: string | null;
  address_line: string | null;
  pin_lat: number | null;
  pin_lng: number | null;
  customer_phone: string | null;
  items: { name_en: string; name_ar: string; qty: number }[];
}

/**
 * Today's deliveries grouped by zone (FR-R-02/03). Uses the service role to expose
 * ONLY the fields a rider needs for an assigned delivery (SDD §3.7 note).
 */
export async function riderDeliveries(): Promise<ApiResult<Record<string, RiderDelivery[]>>> {
  try {
    await requireRole('rider');
    const db = createAdminClient();
    const { data: orders } = await db
      .from('orders')
      .select('*')
      .in('status', ['ready', 'out_for_delivery'])
      .eq('type', 'delivery')
      .order('created_at');
    const grouped: Record<string, RiderDelivery[]> = {};
    for (const o of (orders as Order[]) ?? []) {
      const [{ data: zone }, { data: addr }, { data: cust }, { data: items }] = await Promise.all([
        o.zone_id ? db.from('zones').select('name').eq('id', o.zone_id).single() : Promise.resolve({ data: null }),
        o.address_id ? db.from('addresses').select('line1,pin_lat,pin_lng').eq('id', o.address_id).single() : Promise.resolve({ data: null }),
        db.from('users').select('phone').eq('id', o.customer_id).single(),
        db.from('order_items').select('qty, menu_items(name_en,name_ar)').eq('order_id', o.id),
      ]);
      const zoneName = (zone as { name: string } | null)?.name ?? 'Other';
      (grouped[zoneName] ??= []).push({
        order: o,
        zone_name: zoneName,
        address_line: (addr as any)?.line1 ?? null,
        pin_lat: (addr as any)?.pin_lat ?? null,
        pin_lng: (addr as any)?.pin_lng ?? null,
        customer_phone: (cust as any)?.phone ?? null,
        items: ((items as any[]) ?? []).map((r) => ({ name_en: r.menu_items.name_en, name_ar: r.menu_items.name_ar, qty: r.qty })),
      });
    }
    return ok(grouped);
  } catch (e) {
    return e instanceof RoleError ? fail(e.code, e.code) : fail('internal', 'error');
  }
}

export async function riderPickup(id: string): Promise<ApiResult<Order>> {
  await requireRole('rider');
  return advanceOrder({ id, to_status: 'out_for_delivery' }); // FR-R-05
}
export async function riderDeliver(id: string): Promise<ApiResult<Order>> {
  await requireRole('rider');
  return advanceOrder({ id, to_status: 'delivered' }); // FR-R-06
}

/** Build a Google Maps deep-link from a saved pin or address (FR-R-04; no paid API). */
export async function mapsLink(lat: number | null, lng: number | null, address: string | null): Promise<string> {
  if (lat != null && lng != null) return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address ?? '')}`;
}
