import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { otpRequestSchema } from '@/lib/utils/schemas';

// POST /api/auth/otp/request — send a phone OTP (FR-C-01). Supabase Auth applies
// built-in rate limiting; OTP_RATE_LIMIT_PER_HOUR documents the policy (FR-S-14).
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'bad_request', message: 'Invalid JSON' } }, { status: 400 });
  }
  const parsed = otpRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: { code: 'validation_error', message: 'Invalid phone' } }, { status: 400 });
  }
  const sb = createClient();
  const { error } = await sb.auth.signInWithOtp({ phone: parsed.data.phone });
  if (error) {
    const rate = /rate|limit/i.test(error.message);
    return NextResponse.json(
      { ok: false, error: { code: rate ? 'rate_limited' : 'bad_request', message: error.message } },
      { status: rate ? 429 : 400 },
    );
  }
  return NextResponse.json({ ok: true, data: { expires_in: 300 } });
}
