import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/auth/sign-out — JS-less / programmatic sign-out fallback. Clears the
// Supabase session and redirects to /login.
export async function POST(req: Request) {
  const sb = createClient();
  await sb.auth.signOut();
  return NextResponse.redirect(new URL('/login', req.url), { status: 303 });
}
