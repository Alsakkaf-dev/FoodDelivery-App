import { NextResponse } from 'next/server';
import { endOfDay } from '@/lib/domain/orders';
import { httpStatus } from '@/lib/utils/api';

// GET /api/admin/eod — end-of-day summary (FR-O-13).
export async function GET() {
  const res = await endOfDay();
  return NextResponse.json(res, { status: res.ok ? 200 : httpStatus(res.error.code) });
}
