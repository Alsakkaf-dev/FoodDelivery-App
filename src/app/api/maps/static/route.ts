import { NextRequest, NextResponse } from 'next/server';
import { lngLatToTile } from '@/lib/maps/tiles';

// GET /api/maps/static?lat=&lng=&z= — server proxy for a single OpenStreetMap
// basemap tile, returned same-origin (CSP img-src 'self'). This gives the
// delivery-point picker a real map backdrop with NO second API key and without
// loosening the browser CSP. Free, low-volume, cached; the picker degrades to a
// stylised basemap if this ever fails. (Distinct from SerpApi — tiles only.)
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const lat = Number(sp.get('lat'));
  const lng = Number(sp.get('lng'));
  const z = Number(sp.get('z') ?? 15);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ ok: false, error: { code: 'bad_request', message: 'bad coords' } }, { status: 400 });
  }

  const { z: tz, x, y } = lngLatToTile(lat, lng, z);
  const tileUrl = `https://tile.openstreetmap.org/${tz}/${x}/${y}.png`;

  try {
    const upstream = await fetch(tileUrl, {
      headers: { 'User-Agent': 'FahmanOrders/1.0 (delivery app map preview)' },
      // Tiles are immutable for a given z/x/y — let the platform cache them.
      next: { revalidate: 86_400 },
    });
    if (!upstream.ok) return new NextResponse(null, { status: 502 });
    const body = await upstream.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
