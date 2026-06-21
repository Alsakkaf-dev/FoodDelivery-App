import { NextResponse } from 'next/server';
import { riderDeliveries } from '@/lib/domain/rider';
import { httpStatus } from '@/lib/utils/api';

// GET /api/rider/deliveries — today's deliveries grouped by zone (FR-R-02/03).
export async function GET() {
  const res = await riderDeliveries();
  return NextResponse.json(res, { status: res.ok ? 200 : httpStatus(res.error.code) });
}
