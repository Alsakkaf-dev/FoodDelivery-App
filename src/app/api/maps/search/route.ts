import { NextRequest, NextResponse } from 'next/server';
import { searchPlaces } from '@/lib/maps/places';
import { httpStatus } from '@/lib/utils/api';
import { getLocale } from '@/lib/i18n/server';

// GET /api/maps/search?q=&lat=&lng=&zoom= — Google Maps place search (SerpApi).
// Same-origin so the browser never sees the API key (CSP connect-src 'self').
// The key + SerpApi call live entirely server-side via the places domain.
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const input = {
    q: sp.get('q') ?? '',
    lat: sp.get('lat') ?? undefined,
    lng: sp.get('lng') ?? undefined,
    zoom: sp.get('zoom') ?? undefined,
  };
  const res = await searchPlaces(input, getLocale());
  return NextResponse.json(res, { status: res.ok ? 200 : httpStatus(res.error.code) });
}
