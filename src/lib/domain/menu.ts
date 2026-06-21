'use server';
import { createClient } from '@/lib/supabase/server';
import { requireRole, RoleError } from '@/lib/auth/roles';
import { ok, fail, type ApiResult } from '@/lib/utils/api';
import { menuUpsertSchema } from '@/lib/utils/schemas';
import type { MenuItem } from '@/types/db';

export async function listMenu(): Promise<ApiResult<MenuItem[]>> {
  const sb = createClient();
  const { data, error } = await sb.from('menu_items').select('*').order('sort_order');
  if (error) return fail('internal', error.message);
  return ok((data as MenuItem[]) ?? []);
}

export async function upsertMenuItem(input: unknown): Promise<ApiResult<MenuItem>> {
  try {
    await requireRole('operator');
    const parsed = menuUpsertSchema.safeParse(input);
    if (!parsed.success) return fail('validation_error', 'Invalid item', parsed.error.flatten());
    const sb = createClient();
    const { data, error } = await sb.from('menu_items').upsert(parsed.data).select('*').single();
    if (error) return fail('forbidden', error.message);
    return ok(data as MenuItem);
  } catch (e) {
    return e instanceof RoleError ? fail(e.code, e.code) : fail('internal', 'error');
  }
}

export async function setAvailability(id: string, available: boolean): Promise<ApiResult<true>> {
  try {
    await requireRole('operator');
    const sb = createClient();
    const { error } = await sb.from('menu_items').update({ available }).eq('id', id);
    if (error) return fail('not_found', error.message);
    return ok(true);
  } catch (e) {
    return e instanceof RoleError ? fail(e.code, e.code) : fail('internal', 'error');
  }
}
