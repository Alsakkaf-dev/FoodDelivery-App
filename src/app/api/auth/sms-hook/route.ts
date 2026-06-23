import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsApp } from '@/lib/notifications/whatsapp';
import { verifySmsHook } from '@/lib/auth/verify-sms-hook';

// Supabase "Send SMS Hook" target. Supabase generates & verifies the phone OTP and
// owns the session; this endpoint only DELIVERS the code — over WhatsApp instead of SMS.
// Configure in Supabase → Authentication → Hooks → "Send SMS Hook" → this URL.
//
// IMPORTANT: Supabase (cloud) can only reach this once the app is DEPLOYED — not on
// localhost. For local testing use the Email channel. Set WHATSAPP_TOKEN +
// WHATSAPP_PHONE_NUMBER_ID (Meta) so sendWhatsApp() is live, and SEND_SMS_HOOK_SECRET
// (from the hook config) so the request signature can be verified below.

type SmsHookPayload = {
  user?: { phone?: string };
  sms?: { otp?: string };
  phone?: string;
  otp?: string;
};

export async function POST(req: NextRequest) {
  const raw = await req.text();

  // Reject any request that isn't a signed Supabase hook call (StandardWebhooks).
  // Without this, anyone could POST a phone+otp here and burn your WhatsApp quota.
  const verified = verifySmsHook(req.headers, raw);
  if (!verified.ok) {
    return NextResponse.json(
      { error: { http_code: 401, message: `unauthorized_${verified.reason}` } },
      { status: 401 },
    );
  }

  let payload: SmsHookPayload;
  try {
    payload = JSON.parse(raw) as SmsHookPayload;
  } catch {
    return NextResponse.json({ error: { http_code: 400, message: 'invalid payload' } }, { status: 400 });
  }

  const phone = payload.user?.phone ?? payload.phone;
  const otp = payload.sms?.otp ?? payload.otp;
  if (!phone || !otp) {
    return NextResponse.json({ error: { http_code: 400, message: 'missing phone or otp' } }, { status: 400 });
  }

  const body = `Fahman Orders — your login code is ${otp} (valid a few minutes). / رمز دخولك إلى فهمان أوردرز: ${otp}`;
  const sent = await sendWhatsApp(phone, body);
  if (!sent.ok) {
    return NextResponse.json({ error: { http_code: 500, message: `whatsapp_${sent.reason}` } }, { status: 500 });
  }
  return NextResponse.json({}, { status: 200 });
}
