import { z } from 'zod';
import type { OrderType } from '@/types/db';

// All server-action inputs are validated with Zod (SDD §6.1).

const phone = z.string().regex(/^\+?[0-9]{8,15}$/, 'invalid_phone');

export const otpRequestSchema = z.object({ phone });
export const otpVerifySchema = z.object({ phone, code: z.string().length(6) });

// Email OTP (free, built-in Supabase channel — no SMS provider needed).
export const emailRequestSchema = z.object({ email: z.string().email() });
export const emailVerifySchema = z.object({ email: z.string().email(), code: z.string().length(6) });

// Profile self-service edit. All fields optional — only changed ones are sent.
// RLS (users_update_own) restricts the write to the caller's own row.
export const profileUpdateSchema = z.object({
  name: z.string().trim().min(1, 'name_required').max(80).optional(),
  email: z.string().email().optional(),
  bio: z.string().max(300).optional(),
  avatar_url: z.string().url().optional(),
});

export const cartItemSchema = z.object({
  menu_item_id: z.string().uuid(),
  qty: z.number().int().positive().max(50),
});

export const createOrderSchema = z
  .object({
    type: z.enum(['delivery', 'pickup']),
    zone_id: z.string().uuid().nullable().optional(),
    address_id: z.string().uuid().nullable().optional(),
    payment_method: z.enum(['cod', 'duitnow_qr']),
    proof_url: z.string().url().nullable().optional(),
    items: z.array(cartItemSchema).min(1, 'empty_cart'),
    idempotency_key: z.string().min(8).max(120),
  })
  .refine((v) => v.type === 'pickup' || (v.zone_id && v.address_id), {
    message: 'delivery_requires_zone_address',
    path: ['zone_id'],
  });

export const configureSessionSchema = z.object({
  qty_total: z.number().int().min(0).max(1000),
  cutoff_time: z.string().regex(/^\d{2}:\d{2}$/),
  delivery_window: z.string().min(1).max(80),
  active_zone_ids: z.array(z.string().uuid()),
});

export const menuUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name_en: z.string().min(1).max(80),
  name_ar: z.string().min(1).max(80),
  description_en: z.string().max(300).nullable().optional(),
  description_ar: z.string().max(300).nullable().optional(),
  price: z.number().nonnegative(),
  photo_url: z.string().url().nullable().optional(),
  available: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

// Google Maps place-search input (server route + domain). `q` is the user's
// query; lat/lng/zoom are the optional search origin (browser geolocation, else
// the Johor default applied server-side). Coordinates are range-checked here so
// a malformed querystring is rejected before it reaches SerpApi.
export const placeSearchSchema = z.object({
  q: z.string().trim().min(3, 'query_too_short').max(120),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  zoom: z.coerce.number().int().min(3).max(21).optional(),
});

export type PlaceSearchInput = z.infer<typeof placeSearchSchema>;

export const addressSchema = z.object({
  zone_id: z.string().uuid(),
  label: z.string().max(40).nullable().optional(),
  line1: z.string().min(3).max(200),
  pin_lat: z.number().min(-90).max(90).nullable().optional(),
  pin_lng: z.number().min(-180).max(180).nullable().optional(),
});

export const advanceOrderSchema = z.object({
  id: z.string().uuid(),
  to_status: z.enum(['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered']),
});

export const broadcastSchema = z.object({
  message_en: z.string().min(1).max(500),
  message_ar: z.string().min(1).max(500),
});

// Client-side checkout gate (US-014/US-015) — mirrors `createOrderSchema.refine`:
// a delivery order needs BOTH an active zone and a saved address; pickup needs
// neither. Used to block "Continue to payment" until step 1 is complete.
export function deliveryReady(
  type: OrderType,
  zoneId: string | null | undefined,
  addressId: string | null | undefined,
): boolean {
  return type === 'pickup' || Boolean(zoneId && addressId);
}

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ConfigureSessionInput = z.infer<typeof configureSessionSchema>;
