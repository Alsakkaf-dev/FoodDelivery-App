import type { Lang } from '@/types/db';

// Bilingual notification templates (SDD §7.2). Variables are {{name}}, {{order_no}}, etc.
// Event codes EVT-01..11 (SDD §7.1).
export type EventCode =
  | 'order_received' | 'order_confirmed' | 'being_prepared' | 'order_ready'
  | 'out_for_delivery' | 'delivered' | 'order_cancelled' | 'sold_out'
  | 'shop_open' | 'announcement' | 'payment_status';

type Pair = { en: string; ar: string };

export const TEMPLATES: Record<EventCode, Pair> = {
  order_received: {
    en: "Hi {{name}}, we've received your order {{order_no}}. We'll confirm shortly.",
    ar: 'مرحباً {{name}}، استلمنا طلبك {{order_no}} وسنؤكده قريباً.',
  },
  order_confirmed: {
    en: 'Your order {{order_no}} is confirmed. Estimated delivery: {{window}}.',
    ar: 'تم تأكيد طلبك {{order_no}}. وقت التوصيل المتوقع: {{window}}.',
  },
  being_prepared: {
    en: 'Good news — your order {{order_no}} is being prepared.',
    ar: 'خبر سار — يتم تحضير طلبك {{order_no}} الآن.',
  },
  order_ready: {
    en: 'Your order {{order_no}} is ready.',
    ar: 'طلبك {{order_no}} جاهز.',
  },
  out_for_delivery: {
    en: 'Your order {{order_no}} is on the way.',
    ar: 'طلبك {{order_no}} في الطريق إليك.',
  },
  delivered: {
    en: 'Your order {{order_no}} has been delivered. Thank you!',
    ar: 'تم توصيل طلبك {{order_no}}. شكراً لك!',
  },
  order_cancelled: {
    en: 'Your order {{order_no}} was cancelled. {{reason}}',
    ar: 'تم إلغاء طلبك {{order_no}}. {{reason}}',
  },
  sold_out: {
    en: "We're sold out for today — thank you! See you tomorrow, 1–7 PM.",
    ar: 'نفدت الكمية لليوم — شكراً لكم! نراكم غداً من ١ إلى ٧ مساءً.',
  },
  shop_open: {
    en: "We're open now! Order before {{cutoff}}.",
    ar: 'نحن مفتوحون الآن! اطلب قبل {{cutoff}}.',
  },
  announcement: { en: '{{message}}', ar: '{{message}}' },
  payment_status: {
    en: 'Payment for {{order_no}}: {{status}}.',
    ar: 'حالة الدفع للطلب {{order_no}}: {{status}}.',
  },
};

// Map an order status to its notification event (SDD §7.1).
export const STATUS_EVENT: Record<string, EventCode> = {
  new: 'order_received',
  confirmed: 'order_confirmed',
  preparing: 'being_prepared',
  ready: 'order_ready',
  out_for_delivery: 'out_for_delivery',
  delivered: 'delivered',
  cancelled: 'order_cancelled',
};

export function render(event: EventCode, lang: Lang, vars: Record<string, string> = {}): string {
  let s = TEMPLATES[event][lang];
  for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{{${k}}}`, v);
  // strip any unfilled variables
  return s.replace(/\{\{\s*\w+\s*\}\}/g, '').replace(/\s+/g, ' ').trim();
}
