import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { emailVerifySchema } from '@/lib/utils/schemas';
import { ensureProfile } from '@/lib/auth/provision';

// POST /api/auth/email/verify — verify the emailed code, create the session, and
// provision a profile with PDPA consent on first sign-in (mirrors the phone flow).
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'bad_request', message: 'Invalid JSON' } }, { status: 400 });
  }
  const parsed = emailVerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: { code: 'validation_error', message: 'Invalid input' } }, { status: 400 });
  }
  const sb = createClient();
  const { data, error } = await sb.auth.verifyOtp({ email: parsed.data.email, token: parsed.data.code, type: 'email' });
  if (error || !data.user) {
    return NextResponse.json({ ok: false, error: { code: 'unauthorized', message: error?.message ?? 'Invalid code' } }, { status: 401 });
  }
  // Store the email in its own column (no more email-as-phone hack). Tolerant of
  // provisioning hiccups so the Supabase session is still returned.
  const prof = await ensureProfile({
    id: data.user.id,
    email: data.user.email ?? parsed.data.email,
    recordConsent: true,
  }).catch(() => ({ role: 'customer', lang: 'en' }));
  return NextResponse.json({ ok: true, data: { role: prof.role, lang: prof.lang } }, { status: 201 });
}
