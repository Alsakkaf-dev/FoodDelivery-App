// Domain types mirroring the Supabase schema (supabase/migrations/0001_init.sql).

export type Role = 'customer' | 'operator' | 'rider';
export type Lang = 'en' | 'ar';
export type ShopStatus = 'open' | 'closed' | 'sold_out';
export type OrderStatus =
  | 'new' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type OrderType = 'delivery' | 'pickup';
export type PaymentMethod = 'cod' | 'duitnow_qr';
export type PaymentStatus = 'pending' | 'submitted' | 'verified' | 'rejected';
export type Channel = 'whatsapp' | 'web_push';

export interface UserProfile {
  id: string; phone: string; role: Role; name: string | null; lang: Lang;
  consent_at: string | null; created_at: string;
}
export interface Zone { id: string; name: string; active: boolean; sort_order: number; }
export interface Address {
  id: string; user_id: string; zone_id: string; label: string | null;
  line1: string; pin_lat: number | null; pin_lng: number | null; created_at: string;
}
export interface MenuItem {
  id: string; name_en: string; name_ar: string; description_en: string | null;
  description_ar: string | null; price: number; photo_url: string | null;
  available: boolean; sort_order: number;
}
export interface DailySession {
  id: string; session_date: string; status: ShopStatus; qty_total: number;
  qty_remaining: number; cutoff_time: string | null; delivery_window: string | null;
  opened_at: string | null; closed_at: string | null; created_at: string;
}
export interface Order {
  id: string; order_no: string; session_id: string; customer_id: string;
  zone_id: string | null; address_id: string | null; type: OrderType; status: OrderStatus;
  payment_method: PaymentMethod; payment_status: PaymentStatus; proof_url: string | null;
  item_count: number; total: number; cancel_reason: string | null;
  created_at: string; updated_at: string;
}
export interface OrderItem {
  id: string; order_id: string; menu_item_id: string; qty: number; unit_price: number;
}
export interface Notification {
  id: string; order_id: string | null; user_id: string | null; event: string;
  channel: Channel; template: string; lang: Lang; status: 'queued' | 'sent' | 'delivered' | 'failed';
  retry_count: number; sent_at: string | null; created_at: string;
}

// Order lifecycle transitions (mirrors SDD §4.1; enforced in domain + DB).
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  new: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready'],
  ready: ['out_for_delivery', 'delivered'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: [],
};
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}
