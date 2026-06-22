import { NextRequest, NextResponse } from 'next/server';
import { eraseUserById } from '@/lib/domain/privacy';
import { httpStatus } from '@/lib/utils/api';

// POST /api/admin/erase — operator-handled PDPA erasure of a user's personal data
// (US-057). Body: { user_id }. Operator role is enforced in the domain action.
export async function POST(req: NextRequest) {
  let body: { user_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'bad_request', message: 'Invalid JSON' } }, { status: 400 });
  }
  const res = await eraseUserById(body.user_id ?? '');
  return NextResponse.json(res, { status: res.ok ? 200 : httpStatus(res.error.code) });
}
