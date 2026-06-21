import { NextResponse } from 'next/server';
import { getStatus } from '@/lib/domain/session';

// GET /api/status — public live status + remaining quantity (FR-C-02/03).
export async function GET() {
  const res = await getStatus();
  return NextResponse.json(res, { status: res.ok ? 200 : 500 });
}
