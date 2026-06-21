import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { otpVerifySchema } from '@/lib/utils/schemas';

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
  const admin = createAdminClient();
  await admin
    .from('users')
    .upsert(
      { id: data.user.id, phone: parsed.data.phone, consent_at: new Date().toISOString() },
      { onConflict: 'id', ignoreDuplicates: false },
    );
  const { data: profile } = await admin.from('users').select('role, lang').eq('id', data.user.id).single();
  return NextResponse.json({ ok: true, data: { role: profile?.role ?? 'customer', lang: profile?.lang ?? 'en' } }, { status: 201 });
}
