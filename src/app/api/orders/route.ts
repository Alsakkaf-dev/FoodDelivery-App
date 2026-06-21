import { NextRequest, NextResponse } from 'next/server';
import { createOrder, listMyOrders } from '@/lib/domain/orders';
import { httpStatus } from '@/lib/utils/api';

// POST /api/orders — create order (FR-C-05..10). Requires Idempotency-Key header.
export async function POST(req: NextRequest) {
  const idem = req.headers.get('Idempotency-Key') ?? '';
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'bad_request', message: 'Invalid JSON' } }, { status: 400 });
  }
  const res = await createOrder({ ...(body as object), idempotency_key: idem });
  return NextResponse.json(res, { status: res.ok ? 201 : httpStatus(res.error.code) });
}

// GET /api/orders — current customer's order history (FR-C-12).
export async function GET() {
  const res = await listMyOrders();
  return NextResponse.json(res, { status: res.ok ? 200 : httpStatus(res.error.code) });
}
