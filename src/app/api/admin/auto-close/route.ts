import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/admin/auto-close — close ordering at the cut-off and at 19:00 MYT
// (FR-S-04/05). Calls the SQL `auto_close_expired_sessions()` RPC. Protected by a
// shared secret header so a free scheduled job (GitHub Actions) can trigger it
// without exposing the action. The secret lives in env only (AUTO_CLOSE_SECRET).
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const secret = process.env.AUTO_CLOSE_SECRET;
  const provided = req.headers.get('x-auto-close-secret');
  if (!secret || provided !== secret) {
    return NextResponse.json({ ok: false, error: { code: 'unauthorized', message: 'forbidden' } }, { status: 401 });
  }
  const db = createAdminClient();
  const { error } = await db.rpc('auto_close_expired_sessions');
  if (error) {
    return NextResponse.json({ ok: false, error: { code: 'internal', message: error.message } }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
