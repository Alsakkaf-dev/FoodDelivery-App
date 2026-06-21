'use server';
import { createClient } from '@/lib/supabase/server';
import { requireRole, RoleError } from '@/lib/auth/roles';
import { ok, fail, type ApiResult } from '@/lib/utils/api';
import type { Zone } from '@/types/db';

export async function listZones(activeOnly = false): Promise<ApiResult<Zone[]>> {
  const sb = createClient();
  let q = sb.from('zones').select('*').order('sort_order');
  if (activeOnly) q = q.eq('active', true);
  const { data, error } = await q;
  if (error) return fail('internal', error.message);
  return ok((data as Zone[]) ?? []);
}

export async function upsertZone(zone: { id?: string; name: string; active: boolean; sort_order: number }): Promise<ApiResult<true>> {
  try {
    await requireRole('operator');
    const sb = createClient();
    const { error } = await sb.from('zones').upsert(zone);
    if (error) return fail('forbidden', error.message);
    return ok(true);
  } catch (e) {
    return e instanceof RoleError ? fail(e.code, e.code) : fail('internal', 'error');
  }
}
