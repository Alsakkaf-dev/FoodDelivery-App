'use server';
import { createClient } from '@/lib/supabase/server';
import { requireRole, RoleError } from '@/lib/auth/roles';
import { ok, fail, type ApiResult } from '@/lib/utils/api';
import { addressSchema } from '@/lib/utils/schemas';
import type { Address } from '@/types/db';

export async function listAddresses(): Promise<ApiResult<Address[]>> {
  try {
    const me = await requireRole('customer', 'operator', 'rider');
    const sb = createClient();
    const { data, error } = await sb.from('addresses').select('*').eq('user_id', me.id).order('created_at');
    if (error) return fail('internal', error.message);
    return ok((data as Address[]) ?? []);
  } catch (e) {
    return e instanceof RoleError ? fail(e.code, e.code) : fail('internal', 'error');
  }
}

export async function createAddress(input: unknown): Promise<ApiResult<Address>> {
  try {
    const me = await requireRole('customer');
    const parsed = addressSchema.safeParse(input);
    if (!parsed.success) return fail('validation_error', 'Invalid address', parsed.error.flatten());
    const sb = createClient();
    const { data, error } = await sb
      .from('addresses')
      .insert({ ...parsed.data, user_id: me.id })
      .select('*')
      .single();
    if (error) return fail('internal', error.message);
    return ok(data as Address);
  } catch (e) {
    return e instanceof RoleError ? fail(e.code, e.code) : fail('internal', 'error');
  }
}
