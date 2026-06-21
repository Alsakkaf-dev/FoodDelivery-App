import { NextRequest, NextResponse } from 'next/server';
import { requireRole, RoleError } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';

// POST /api/push/subscribe — store a Web Push subscription (FR-S-11, FR-C-13).
export async function POST(req: NextRequest) {
  try {
    const me = await requireRole('customer', 'operator', 'rider');
    const sub = await req.json();
    if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
      return NextResponse.json({ ok: false, error: { code: 'bad_request', message: 'Invalid subscription' } }, { status: 400 });
    }
    const sb = createClient();
    await sb.from('push_subscriptions').upsert(
      { user_id: me.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      { onConflict: 'endpoint' },
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    const code = e instanceof RoleError ? e.code : 'internal';
    return NextResponse.json({ ok: false, error: { code, message: code } }, { status: code === 'unauthorized' ? 401 : 500 });
  }
}
