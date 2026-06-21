import 'server-only';

// WhatsApp Business Cloud API sender (SDD §6.10, §7.3). Free tier; primary channel.
// If credentials are absent (e.g. approval still pending — Risk R1), this returns
// { ok:false, reason:'not_configured' } so the caller falls back to Web Push.
export async function sendWhatsApp(toPhone: string, body: string): Promise<{ ok: boolean; id?: string; reason?: string }> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) {
    // TODO: enable once Meta approves the WhatsApp templates; until then Web Push is used.
    return { ok: false, reason: 'not_configured' };
  }
  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: toPhone.replace(/^\+/, ''),
        type: 'text',
        text: { body },
      }),
    });
    if (!res.ok) return { ok: false, reason: `http_${res.status}` };
    const json = (await res.json()) as { messages?: { id: string }[] };
    return { ok: true, id: json.messages?.[0]?.id };
  } catch (e) {
    return { ok: false, reason: 'network' };
  }
}

import crypto from 'node:crypto';
// Verify the X-Hub-Signature-256 HMAC on inbound delivery receipts (SDD §6.10).
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !signature) return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
