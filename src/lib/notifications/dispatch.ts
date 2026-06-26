import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { render, type EventCode } from './templates';
import { sendWhatsApp } from './whatsapp';
import { sendWebPush, type PushSub } from './webpush';
import type { Lang } from '@/types/db';

/**
 * Dispatch exactly one notification for an order transition or broadcast
 * (SDD §7.3). WhatsApp first, then Web Push fallback. Dedupe is enforced by the
 * DB UNIQUE(order_id, event) constraint (FR-S-09) — a duplicate insert is ignored.
 */
export async function dispatchOrderEvent(opts: {
  orderId: string;
  userId: string;
  phone: string | null;
  lang: Lang;
  event: EventCode;
  vars?: Record<string, string>;
}) {
  const db = createAdminClient();
  // 1) record intent (dedup). If it already exists, stop — already sent once.
  const { error: insErr } = await db.from('notifications').insert({
    order_id: opts.orderId,
    user_id: opts.userId,
    event: opts.event,
    channel: 'whatsapp',
    template: opts.event,
    lang: opts.lang,
    status: 'queued',
  });
  if (insErr) return { ok: true, deduped: true }; // unique violation -> already handled

  const body = render(opts.event, opts.lang, opts.vars);

  // 2) try WhatsApp (skipped when the user has no phone — e.g. email/OAuth sign-up)
  const wa = opts.phone
    ? await sendWhatsApp(opts.phone, body)
    : { ok: false as const, reason: 'no_phone' };
  if (wa.ok) {
    await db
      .from('notifications')
      .update({ status: 'sent', sent_at: new Date().toISOString(), provider_message_id: wa.id ?? null })
      .eq('order_id', opts.orderId)
      .eq('event', opts.event);
    return { ok: true, channel: 'whatsapp' };
  }

  // 3) fallback to Web Push (FR-S-11)
  const { data: subs } = await db.from('push_subscriptions').select('*').eq('user_id', opts.userId);
  let pushed = false;
  for (const s of subs ?? []) {
    const sub: PushSub = { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } };
    const r = await sendWebPush(sub, { title: 'Fahman Orders', body });
    pushed = pushed || r.ok;
  }
  await db
    .from('notifications')
    .update({ channel: 'web_push', status: pushed ? 'sent' : 'failed', sent_at: new Date().toISOString() })
    .eq('order_id', opts.orderId)
    .eq('event', opts.event);
  return { ok: pushed, channel: 'web_push' };
}

/** Operator broadcast to all opted-in customers (FR-O-12). Throttled by the caller. */
export async function dispatchBroadcast(messageEn: string, messageAr: string) {
  const db = createAdminClient();
  const { data: users } = await db
    .from('users')
    .select('id, phone, lang')
    .eq('role', 'customer')
    .not('consent_at', 'is', null);
  let count = 0;
  for (const u of users ?? []) {
    const body = u.lang === 'ar' ? messageAr : messageEn;
    await db.from('notifications').insert({
      user_id: u.id, event: 'announcement', channel: 'whatsapp', template: 'announcement',
      lang: u.lang, status: 'queued',
    });
    const wa = await sendWhatsApp(u.phone, body);
    if (!wa.ok) {
      const { data: subs } = await db.from('push_subscriptions').select('*').eq('user_id', u.id);
      for (const s of subs ?? []) {
        await sendWebPush({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, { title: 'Fahman Orders', body });
      }
    }
    count++;
  }
  return { count };
}
