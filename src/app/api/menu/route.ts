import { NextResponse } from 'next/server';
import { listMenu } from '@/lib/domain/menu';

// GET /api/menu — public menu (FR-C-04).
export async function GET() {
  const res = await listMenu();
  return NextResponse.json(res, { status: res.ok ? 200 : 500 });
}
