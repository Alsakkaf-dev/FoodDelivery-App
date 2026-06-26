import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/auth/provision';
import { homeForRole } from '@/lib/auth/roles';
import type { Role } from '@/types/db';

// GET /api/auth/callback — finalizes the Google OAuth (PKCE) redirect: exchanges the
// code for a session, provisions the profile (name + avatar from the Google
// identity), then routes to ?next or the role home.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const origin = url.origin;
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next');
  const fail = () => NextResponse.redirect(new URL('/login?error=oauth', origin));
  if (!code) return fail();

  const sb = createClient();
  const { error } = await sb.auth.exchangeCodeForSession(code);
  if (error) return fail();

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return fail();

  const meta = (user.user_metadata ?? {}) as {
    full_name?: string; name?: string; avatar_url?: string; picture?: string;
  };
  const { role } = await ensureProfile({
    id: user.id,
    email: user.email ?? null,
    name: meta.full_name ?? meta.name ?? null,
    avatar_url: meta.avatar_url ?? meta.picture ?? null,
    recordConsent: true,
  }).catch(() => ({ role: 'customer' as string }));

  return NextResponse.redirect(new URL(next || homeForRole(role as Role), origin));
}
