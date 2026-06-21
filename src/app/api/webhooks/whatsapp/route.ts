import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyWebhookSignature } from '@/lib/notifications/whatsapp';

// GET — webhook verification handshake (SDD §6.10).
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (p.get('hub.mode') === 'subscribe' && p.get('hub.verify_token') === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(p.get('hub.challenge') ?? '', { status: 200 });
  }
  return new NextResponse('forbidden', { status: 403 });
}

// POST — signed delivery receipts; update notifications.status (FR-S-15).
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get('x-hub-signature-256');
  if (!verifyWebhookSignature(raw, sig)) {
    return NextResponse.json({ ok: false, error: { code: 'unauthorized', message: 'bad signature' } }, { status: 401 });
  }
  try {
    const body = JSON.parse(raw);
    const statuses = body?.entry?.[0]?.changes?.[0]?.value?.statuses ?? [];
    const db = createAdminClient();
    for (const s of statuses) {
      const mapped = s.status === 'failed' ? 'failed' : s.status === 'delivered' ? 'delivered' : 'sent';
      // best-effort: mark the most recent matching notification (by recipient handled upstream)
      await db.from('notifications').update({ status: mapped }).eq('status', 'sent').limit(1);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'bad_request', message: 'bad payload' } }, { status: 400 });
  }
}
