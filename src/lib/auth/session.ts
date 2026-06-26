'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// Sign the current user out (clears the Supabase session cookies) and return to the
// login screen. Used by the account logout control and the /api/auth/sign-out route.
export async function signOutAction() {
  const sb = createClient();
  await sb.auth.signOut();
  redirect('/login');
}
