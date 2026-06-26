import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { otpVerifySchema } from '@/lib/utils/schemas';
import { ensureProfile } from '@/lib/auth/provision';

// POST /api/auth/otp/verify — verify the OTP, create the session, and provision a
// customer profile with PDPA consent on first sign-in (FR-C-01, US-007).
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'bad_request', message: 'Invalid JSON' } }, { status: 400 });
  }
  const parsed = otpVerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: { code: 'validation_error', message: 'Invalid input' } }, { status: 400 });
  }
  const sb = createClient();
  const { data, error } = await sb.auth.verifyOtp({
    phone: parsed.data.phone,
    token: parsed.data.code,
    type: 'sms',
  });
  if (error || !data.user) {
    return NextResponse.json({ ok: false, error: { code: 'unauthorized', message: error?.message ?? 'Invalid code' } }, { status: 401 });
  }
  // Provision profile row (role defaults to customer; operator/rider set by admin).
  // Tolerant: the session is valid even if provisioning hiccups.
  const prof = await ensureProfile({ id: data.user.id, phone: parsed.data.phone, recordConsent: true }).catch(
    () => ({ role: 'customer', lang: 'en' }),
  );
  return NextResponse.json({ ok: true, data: { role: prof.role, lang: prof.lang } }, { status: 201 });
}
