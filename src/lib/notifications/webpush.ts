import 'server-only';
import webpush from 'web-push';

// Free Web Push fallback (FR-S-11). VAPID keys from env (see .env.example).
let configured = false;
function ensure() {
  if (configured) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:ops@example.com', pub, priv);
  configured = true;
  return true;
}

export type PushSub = { endpoint: string; keys: { p256dh: string; auth: string } };

export async function sendWebPush(sub: PushSub, payload: { title: string; body: string; url?: string }) {
  if (!ensure()) return { ok: false, reason: 'not_configured' };
  try {
    await webpush.sendNotification(sub, JSON.stringify(payload));
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: 'send_failed' };
  }
}
