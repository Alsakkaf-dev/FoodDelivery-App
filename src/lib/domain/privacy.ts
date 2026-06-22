'use server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole, RoleError } from '@/lib/auth/roles';
import { ok, fail, type ApiResult } from '@/lib/utils/api';

// PDPA data erasure (US-057, NFR-C-02/03). The consent version lives in
// '@/lib/utils/consent' (a plain module — a 'use server' file may only export
// async functions).
//
// Anonymize a user's personal data: delete their addresses and scrub phone/name on
// the user row (phone is NOT NULL + unique, so it is replaced with a non-PII
// tombstone rather than nulled), then write an audit row. Service-role only.
async function eraseUser(db: ReturnType<typeof createAdminClient>, userId: string) {
  await db.from('addresses').delete().eq('user_id', userId);
  await db.from('users').update({ phone: `deleted-${userId}`, name: null }).eq('id', userId);
  await db.from('erasure_audit').insert({ user_id: userId, fields: 'phone,name,addresses' });
}

/** Self-service erasure: the signed-in user erases their own personal data (US-057). */
export async function requestErasure(): Promise<ApiResult<true>> {
  try {
    const me = await requireRole('customer', 'operator', 'rider');
    await eraseUser(createAdminClient(), me.id);
    return ok(true);
  } catch (e) {
    return e instanceof RoleError ? fail(e.code, e.code) : fail('internal', 'error');
  }
}

/** Operator-initiated erasure of a specific user (handling a verified request). */
export async function eraseUserById(userId: string): Promise<ApiResult<true>> {
  try {
    await requireRole('operator');
    if (!userId) return fail('validation_error', 'user_id required');
    await eraseUser(createAdminClient(), userId);
    return ok(true);
  } catch (e) {
    return e instanceof RoleError ? fail(e.code, e.code) : fail('internal', 'error');
  }
}
