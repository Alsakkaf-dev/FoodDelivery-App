'use server';
import { createClient } from '@/lib/supabase/server';
import { requireRole, RoleError } from '@/lib/auth/roles';
import { ok, fail, type ApiResult } from '@/lib/utils/api';
import { profileUpdateSchema } from '@/lib/utils/schemas';
import type { UserProfile } from '@/types/db';

// Update the signed-in user's own profile (name / email / bio / avatar). The
// request-bound client runs as the user, so RLS `users_update_own` guarantees the
// write can only touch their own row — defence in depth beneath this requireRole.
export async function updateProfile(input: unknown): Promise<ApiResult<UserProfile>> {
  try {
    const me = await requireRole('customer', 'operator', 'rider');
    const parsed = profileUpdateSchema.safeParse(input);
    if (!parsed.success) return fail('validation_error', 'Invalid profile', parsed.error.flatten());
    if (Object.keys(parsed.data).length === 0) return ok(me);

    const sb = createClient();
    const { data, error } = await sb.from('users').update(parsed.data).eq('id', me.id).select('*').single();
    if (error) return fail('internal', error.message);
    return ok(data as UserProfile);
  } catch (e) {
    return e instanceof RoleError ? fail(e.code, e.code) : fail('internal', 'error');
  }
}
