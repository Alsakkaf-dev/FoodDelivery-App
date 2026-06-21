'use server';
import { requireRole, RoleError } from '@/lib/auth/roles';
import { ok, fail, type ApiResult } from '@/lib/utils/api';
import { broadcastSchema } from '@/lib/utils/schemas';
import { dispatchBroadcast } from '@/lib/notifications/dispatch';
import { createAdminClient } from '@/lib/supabase/admin';

const LIMIT = Number(process.env.BROADCAST_RATE_LIMIT_PER_DAY ?? 10);

/** Operator broadcast to all opted-in customers (FR-O-12). Throttled per day (429). */
export async function broadcast(input: unknown): Promise<ApiResult<{ count: number }>> {
  try {
    await requireRole('operator');
    const parsed = broadcastSchema.safeParse(input);
    if (!parsed.success) return fail('validation_error', 'Message required', parsed.error.flatten());

    // throttle: count today's announcement notifications (anti-spam, SDD §7.3)
    const db = createAdminClient();
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const { count } = await db
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('event', 'announcement')
      .gte('created_at', since.toISOString());
    if ((count ?? 0) >= LIMIT) return fail('rate_limited', 'Daily broadcast limit reached.');

    const res = await dispatchBroadcast(parsed.data.message_en, parsed.data.message_ar);
    return ok(res);
  } catch (e) {
    return e instanceof RoleError ? fail(e.code, e.code) : fail('internal', 'error');
  }
}
