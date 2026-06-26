import type { Locale } from '@/lib/i18n/config';
import { translate, type Dictionary } from '@/lib/i18n/dictionaries';

// ─────────────────────────────────────────────────────────────────────────────
// DEMO VIEW-MODELS (preview only — NOT the frozen db.ts types).
//
// The customer notifications-feed, the messages inbox and chat threads have NO
// backend yet (the `notifications` table is a dispatch/delivery-tracking log, and
// there is no messages/conversations table or realtime channel — see the
// consolidated backend request in TEAM_STATUS.md). To ship a deploy-ready demo
// these screens render from the clearly-labeled seed below. Profile + addresses
// use the REAL reads (getProfile / listAddresses). When the backend lands, swap
// these arrays for the live read; the row components stay unchanged.
//
// Row CONTENT (people, message text) is data, so it carries its own en/ar (kept
// out of the dictionary, which is for UI chrome). Screen chrome uses t.<key>.
// ─────────────────────────────────────────────────────────────────────────────

/** A bilingual demo string — picked by the active locale. */
export interface Localized {
  en: string;
  ar: string;
}

export function localize(locale: Locale, v: Localized): string {
  return locale === 'ar' ? v.ar : v.en;
}

/** Relative timestamp from "minutes ago" using the shared dictionary keys. */
export function relTime(t: Dictionary, minsAgo: number): string {
  if (minsAgo < 60) return translate(t, 'time_min_ago', { n: String(minsAgo) });
  return translate(t, 'time_hr_ago', { n: String(Math.floor(minsAgo / 60)) });
}

export interface NotificationVM {
  id: string;
  person: string;
  action: Localized;
  minsAgo: number;
}

export interface MessageVM {
  id: string;
  threadId: string;
  person: string;
  preview: Localized;
  at: string; // wall-clock label, e.g. "19:37"
  unread: number; // 0 = read
  presence: 'online' | 'offline';
}

export interface ChatMessageVM {
  id: string;
  side: 'in' | 'out';
  text: Localized;
  time: string;
  receipt?: 'sent' | 'delivered' | 'read';
}

export const NOTIFICATIONS_SEED: NotificationVM[] = [
  { id: 'n1', person: 'Tanbir Ahmed', action: { en: 'placed a new order', ar: 'أجرى طلباً جديداً' }, minsAgo: 20 },
  { id: 'n2', person: 'Salim Smith', action: { en: 'left a 5 star review', ar: 'ترك تقييماً بخمس نجوم' }, minsAgo: 32 },
  { id: 'n3', person: 'Royal Bengol', action: { en: 'agreed to cancel', ar: 'وافق على الإلغاء' }, minsAgo: 96 },
  { id: 'n4', person: 'Pabel Vuiya', action: { en: 'placed a new order', ar: 'أجرى طلباً جديداً' }, minsAgo: 140 },
];

export const MESSAGES_SEED: MessageVM[] = [
  { id: 'm1', threadId: 't1', person: 'Royal Parvej', preview: { en: 'Sounds awesome!', ar: 'يبدو رائعاً!' }, at: '19:37', unread: 1, presence: 'online' },
  { id: 'm2', threadId: 't2', person: 'Cameron Williamson', preview: { en: 'Ok, just hurry up a little bit…', ar: 'حسناً، فقط أسرع قليلاً…' }, at: '19:37', unread: 2, presence: 'online' },
  { id: 'm3', threadId: 't3', person: 'Ralph Edwards', preview: { en: 'Thanks dude.', ar: 'شكراً يا صديقي.' }, at: '19:37', unread: 0, presence: 'online' },
  { id: 'm4', threadId: 't4', person: 'Cody Fisher', preview: { en: 'How is it going…?', ar: 'كيف تسير الأمور…؟' }, at: '19:37', unread: 0, presence: 'online' },
  { id: 'm5', threadId: 't5', person: 'Eleanor Pena', preview: { en: 'Thanks for the awesome food man…!', ar: 'شكراً على الطعام الرائع يا رجل…!' }, at: '19:37', unread: 0, presence: 'offline' },
];

/** Demo conversation for any thread id (no chat backend yet). */
export function chatSeed(threadId: string): ChatMessageVM[] {
  return [
    { id: `${threadId}-1`, side: 'in', text: { en: 'Hi! I am on the way with your order.', ar: 'مرحباً! أنا في الطريق مع طلبك.' }, time: '19:31' },
    { id: `${threadId}-2`, side: 'out', text: { en: 'Great, thank you!', ar: 'رائع، شكراً لك!' }, time: '19:32', receipt: 'read' },
    { id: `${threadId}-3`, side: 'in', text: { en: 'Could you share the gate number?', ar: 'هل يمكنك إرسال رقم البوابة؟' }, time: '19:35' },
    { id: `${threadId}-4`, side: 'out', text: { en: 'Sure — gate 3, near the lobby.', ar: 'بالتأكيد — البوابة ٣، بجانب الردهة.' }, time: '19:36', receipt: 'delivered' },
  ];
}

export function findConversation(threadId: string): MessageVM | undefined {
  return MESSAGES_SEED.find((m) => m.threadId === threadId);
}

export const TOTAL_UNREAD = MESSAGES_SEED.filter((m) => m.unread > 0).length;

// Profile fields the design shows but the frozen `users` table has no column for
// (email/bio/avatar). Preview-only placeholders so Personal Info / Edit Profile
// render complete; name + phone remain the REAL getProfile() values. Drop these
// once users.email/bio land (consolidated backend request in TEAM_STATUS.md).
export const DEMO_EMAIL = 'hello@example.com';
export const DEMO_BIO: Localized = { en: 'I love fast food', ar: 'أحب الطعام السريع' };
