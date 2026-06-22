import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { emailVerifySchema } from '@/lib/utils/schemas';
import { CONSENT_VERSION } from '@/lib/utils/consent';

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
  // Provision the profile row. `users.phone` is NOT NULL UNIQUE with no format check,
  // so an email user stores their email there as the identifier. Guarded so login still
  // succeeds if the public schema has not been applied yet.
  let role = 'customer';
  let lang = 'en';
  try {
    const admin = createAdminClient();
    await admin
      .from('users')
      .upsert(
        { id: data.user.id, phone: data.user.email ?? data.user.id, consent_at: new Date().toISOString(), consent_version: CONSENT_VERSION },
        { onConflict: 'id', ignoreDuplicates: false },
      );
    const { data: profile } = await admin.from('users').select('role, lang').eq('id', data.user.id).single();
    if (profile?.role) role = profile.role;
    if (profile?.lang) lang = profile.lang;
  } catch {
    // public schema not ready — the Supabase session is still valid.
  }
  return NextResponse.json({ ok: true, data: { role, lang } }, { status: 201 });
}
