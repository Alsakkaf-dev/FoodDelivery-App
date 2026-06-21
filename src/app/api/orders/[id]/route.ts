import { NextRequest, NextResponse } from 'next/server';
import { getOrder } from '@/lib/domain/orders';
import { httpStatus } from '@/lib/utils/api';

// GET /api/orders/{id} — order + items + timeline (FR-C-10). RLS restricts visibility.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const res = await getOrder(params.id);
  return NextResponse.json(res, { status: res.ok ? 200 : httpStatus(res.error.code) });
}
