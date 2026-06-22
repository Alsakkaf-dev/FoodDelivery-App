import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { AUTH_DISABLED, devProfile } from '@/lib/auth/dev-bypass';
import type { Role, UserProfile } from '@/types/db';

/** The signed-in user's profile (role, lang, …) or null. */
export async function getProfile(): Promise<UserProfile | null> {
  // Preview mode: pretend a customer is signed in (see ./dev-bypass.ts).
  if (AUTH_DISABLED) return devProfile('customer');
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
  return (data as UserProfile) ?? null;
}

/** Throws 'unauthorized' / 'forbidden' if the caller is not in `roles`. Returns the profile. */
export async function requireRole(...roles: Role[]): Promise<UserProfile> {
  // Preview mode: every guard passes, taking on the role it asked for so the
  // screen/action behaves as that role (see ./dev-bypass.ts).
  if (AUTH_DISABLED) return devProfile(roles[0] ?? 'customer');
  const profile = await getProfile();
  if (!profile) throw new RoleError('unauthorized');
  if (roles.length && !roles.includes(profile.role)) throw new RoleError('forbidden');
  return profile;
}

export class RoleError extends Error {
  constructor(public code: 'unauthorized' | 'forbidden') {
    super(code);
  }
}

/** Default landing route per role (used after login). */
export function homeForRole(role: Role): string {
  if (role === 'operator') return '/operator';
  if (role === 'rider') return '/rider';
  return '/';
}
