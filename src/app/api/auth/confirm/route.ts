import { NextRequest, NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/auth/provision';
import { homeForRole } from '@/lib/auth/roles';
import type { Role } from '@/types/db';

// GET /api/auth/confirm — lands email-confirmation and password-recovery links.
// Handles both the PKCE `?code=` flow (default @supabase/ssr) and the
// `?token_hash=&type=` OTP-template flow, so it works whichever email template the
// project uses. `?type=recovery` (set on the reset redirect) routes to /reset-password.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const origin = url.origin;
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const fail = () => NextResponse.redirect(new URL('/login?error=link', origin));

  const sb = createClient();
  if (code) {
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (error) return fail();
  } else if (tokenHash && type) {
    const { error } = await sb.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) return fail();
  } else {
    return fail();
  }

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return fail();

  const meta = (user.user_metadata ?? {}) as { name?: string };
  const { role } = await ensureProfile({
    id: user.id,
    email: user.email ?? null,
    name: meta.name ?? null,
    recordConsent: true,
  }).catch(() => ({ role: 'customer' as string }));

  if (type === 'recovery') return NextResponse.redirect(new URL('/reset-password', origin));
  return NextResponse.redirect(new URL(homeForRole(role as Role), origin));
}
