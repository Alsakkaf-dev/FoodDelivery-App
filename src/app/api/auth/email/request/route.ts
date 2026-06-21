import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { emailRequestSchema } from '@/lib/utils/schemas';

// POST /api/auth/email/request — send a login code by email (free Supabase channel,
// no SMS provider required). Supabase applies built-in rate limiting (FR-S-14).
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'bad_request', message: 'Invalid JSON' } }, { status: 400 });
  }
  const parsed = emailRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: { code: 'validation_error', message: 'Invalid email' } }, { status: 400 });
  }
  const sb = createClient();
  const { error } = await sb.auth.signInWithOtp({ email: parsed.data.email, options: { shouldCreateUser: true } });
  if (error) {
    const rate = /rate|limit/i.test(error.message);
    return NextResponse.json(
      { ok: false, error: { code: rate ? 'rate_limited' : 'bad_request', message: error.message } },
      { status: rate ? 429 : 400 },
    );
  }
  return NextResponse.json({ ok: true, data: { expires_in: 3600 } });
}
