import 'server-only';
import crypto from 'node:crypto';

// Verifies a Supabase "Send SMS Hook" request using the Standard Webhooks spec.
// Supabase signs every hook call; without this check, /api/auth/sms-hook would be an
// open "send a WhatsApp to any number" endpoint once WHATSAPP_TOKEN is set (abuse/cost).
//
// Configure: Supabase → Authentication → Hooks → "Send SMS Hook" generates a secret
// (e.g. `v1,whsec_<base64>`). Put it in env as SEND_SMS_HOOK_SECRET.
//
// Headers (Standard Webhooks): webhook-id, webhook-timestamp, webhook-signature.
// Signed content is `${id}.${timestamp}.${rawBody}`; the signature header is a
// space-delimited list of `v1,<base64sig>` entries — we accept if any matches.
export function verifySmsHook(headers: Headers, rawBody: string): { ok: boolean; reason?: string } {
  const secret = process.env.SEND_SMS_HOOK_SECRET;
  if (!secret) return { ok: false, reason: 'no_secret' };

  const id = headers.get('webhook-id');
  const ts = headers.get('webhook-timestamp');
  const sigHeader = headers.get('webhook-signature');
  if (!id || !ts || !sigHeader) return { ok: false, reason: 'missing_headers' };

  // Replay protection: reject if the timestamp is more than 5 minutes from now.
  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum) || Math.abs(Date.now() / 1000 - tsNum) > 300) {
    return { ok: false, reason: 'timestamp' };
  }

  // The signing key is the base64 portion after the `whsec_` (optionally `v1,`) prefix.
  const base64Secret = secret.replace(/^v1,/, '').replace(/^whsec_/, '');
  let key: Buffer;
  try {
    key = Buffer.from(base64Secret, 'base64');
    if (key.length === 0) return { ok: false, reason: 'bad_secret' };
  } catch {
    return { ok: false, reason: 'bad_secret' };
  }

  const expected = crypto.createHmac('sha256', key).update(`${id}.${ts}.${rawBody}`).digest('base64');
  const provided = sigHeader.split(' ').map((p) => p.split(',')[1]).filter((s): s is string => !!s);
  for (const p of provided) {
    try {
      if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(p))) return { ok: true };
    } catch {
      // length mismatch → not a match; keep checking the rest
    }
  }
  return { ok: false, reason: 'mismatch' };
}
