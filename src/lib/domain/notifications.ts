'use server';
import { createClient } from '@/lib/supabase/server';
import { requireRole, RoleError } from '@/lib/auth/roles';
import { ok, fail, type ApiResult } from '@/lib/utils/api';
import { render, TEMPLATES, type EventCode } from '@/lib/notifications/templates';
import type { Lang } from '@/types/db';

export interface NotificationFeedItem {
  id: string;
  label: string;
  minsAgo: number;
}

// The signed-in user's own notification feed. RLS `notif_select` already restricts
// rows to user_id = auth.uid(); the explicit filter keeps the intent clear. Each
// dispatch-log row is rendered to a short localized label via the shared templates
// (order-status events); unfilled {{vars}} are stripped by render().
export async function listMyNotifications(locale: Lang): Promise<ApiResult<NotificationFeedItem[]>> {
  try {
    const me = await requireRole('customer', 'operator', 'rider');
    const sb = createClient();
    const { data, error } = await sb
      .from('notifications')
      .select('id, event, created_at')
      .eq('user_id', me.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) return fail('internal', error.message);

    const now = Date.now();
    const items: NotificationFeedItem[] = (data ?? []).map((n: { id: string; event: string; created_at: string }) => {
      const ev = n.event as EventCode;
      return {
        id: n.id,
        label: TEMPLATES[ev] ? render(ev, locale) : n.event,
        minsAgo: Math.max(0, Math.round((now - new Date(n.created_at).getTime()) / 60000)),
      };
    });
    return ok(items);
  } catch (e) {
    return e instanceof RoleError ? fail(e.code, e.code) : fail('internal', 'error');
  }
}
