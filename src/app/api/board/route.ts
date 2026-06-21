import { NextResponse } from 'next/server';
import { boardList } from '@/lib/domain/orders';
import { httpStatus } from '@/lib/utils/api';

// GET /api/board — operator live order board (FR-O-09).
export async function GET() {
  const res = await boardList();
  return NextResponse.json(res, { status: res.ok ? 200 : httpStatus(res.error.code) });
}
