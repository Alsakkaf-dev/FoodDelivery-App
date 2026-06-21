'use server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole, RoleError } from '@/lib/auth/roles';
import { ok, fail, type ApiResult } from '@/lib/utils/api';
import { configureSessionSchema } from '@/lib/utils/schemas';
import { nowMyt, withinTradingHours } from '@/lib/utils/time';
import type { DailySession } from '@/types/db';

/** Public live status (SDD §6.4, FR-C-02/03). */
export async function getStatus(): Promise<ApiResult<Pick<DailySession, 'status' | 'qty_remaining' | 'qty_total' | 'delivery_window' | 'cutoff_time'>>> {
  const sb = createClient();
  const { date } = nowMyt();
  const { data } = await sb.from('daily_session').select('*').eq('session_date', date).maybeSingle();
  if (!data) return ok({ status: 'closed', qty_remaining: 0, qty_total: 0, delivery_window: null, cutoff_time: null });
  const s = data as DailySession;
  return ok({ status: s.status, qty_remaining: s.qty_remaining, qty_total: s.qty_total, delivery_window: s.delivery_window, cutoff_time: s.cutoff_time });
}

async function todaySession() {
  const db = createAdminClient();
  const { date } = nowMyt();
  let { data } = await db.from('daily_session').select('*').eq('session_date', date).maybeSingle();
  if (!data) {
    const ins = await db.from('daily_session').insert({ session_date: date, status: 'closed' }).select('*').single();
    data = ins.data;
  }
  return data as DailySession;
}

export async function configureSession(input: unknown): Promise<ApiResult<DailySession>> {
  try {
    await requireRole('operator');
    const parsed = configureSessionSchema.safeParse(input);
    if (!parsed.success) return fail('validation_error', 'Invalid setup', parsed.error.flatten());
    const db = createAdminClient();
    const s = await todaySession();
    const { active_zone_ids, ...cfg } = parsed.data;
    // activate the selected zones, deactivate the rest (FR-O-07)
    await db.from('zones').update({ active: false }).neq('id', '00000000-0000-0000-0000-000000000000');
    if (active_zone_ids.length) await db.from('zones').update({ active: true }).in('id', active_zone_ids);
    const { data, error } = await db
      .from('daily_session')
      .update({ qty_total: cfg.qty_total, qty_remaining: cfg.qty_total, cutoff_time: cfg.cutoff_time, delivery_window: cfg.delivery_window })
      .eq('id', s.id)
      .select('*')
      .single();
    if (error) return fail('internal', error.message);
    return ok(data as DailySession);
  } catch (e) {
    return roleFail(e);
  }
}

export async function openShop(): Promise<ApiResult<DailySession>> {
  try {
    await requireRole('operator');
    if (!withinTradingHours()) return fail('conflict', 'Trading hours are 1–7 PM MYT.');
    const db = createAdminClient();
    const s = await todaySession();
    if (s.qty_total <= 0) return fail('conflict', 'Set today’s quantity before opening.');
    const { data, error } = await db
      .from('daily_session')
      .update({ status: 'open', opened_at: new Date().toISOString() })
      .eq('id', s.id)
      .select('*')
      .single();
    if (error) return fail('conflict', error.message);
    return ok(data as DailySession);
  } catch (e) {
    return roleFail(e);
  }
}

export async function closeShop(): Promise<ApiResult<true>> {
  try {
    await requireRole('operator');
    const db = createAdminClient();
    const s = await todaySession();
    await db.from('daily_session').update({ status: 'closed', closed_at: new Date().toISOString() }).eq('id', s.id);
    return ok(true);
  } catch (e) {
    return roleFail(e);
  }
}

export async function setSoldOut(): Promise<ApiResult<true>> {
  try {
    await requireRole('operator');
    const db = createAdminClient();
    const s = await todaySession();
    await db.from('daily_session').update({ status: 'sold_out' }).eq('id', s.id);
    return ok(true);
  } catch (e) {
    return roleFail(e);
  }
}

function roleFail(e: unknown): ApiResult<never> {
  if (e instanceof RoleError) return fail(e.code, e.code);
  return fail('internal', e instanceof Error ? e.message : 'error');
}
