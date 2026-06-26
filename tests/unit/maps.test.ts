import { describe, it, expect } from 'vitest';
import { buildLL, normalizePlace, normalizePlaces } from '@/lib/maps/normalize';
import { buildPlaceLink, buildDirectionsLink } from '@/lib/maps/links';
import { lngLatToTile } from '@/lib/maps/tiles';
import { placeSearchSchema } from '@/lib/utils/schemas';
import type { SerpMapsResponse } from '@/lib/maps/types';

// Pure transforms for the Google Maps (SerpApi) integration. No network — these
// guard the parsing/link math the UI relies on.

describe('buildLL (SerpApi search origin)', () => {
  it('formats @lat,lng,zoomz at 6 dp', () => {
    expect(buildLL(40.7455096, -74.0083012, 14)).toBe('@40.745510,-74.008301,14z');
  });
  it('clamps out-of-range coords and zoom', () => {
    expect(buildLL(999, -999, 99)).toBe('@90.000000,-180.000000,21z');
  });
});

describe('normalizePlace', () => {
  it('prefers place_id, reads coords + rating', () => {
    const p = normalizePlace({
      title: "Joe's Pizza",
      place_id: 'ChIJ_joes',
      data_id: '0x1',
      address: '1435 Broadway, New York, NY 10018',
      type: 'Pizza restaurant',
      rating: 4.5,
      gps_coordinates: { latitude: 40.7549, longitude: -73.987 },
    });
    expect(p).not.toBeNull();
    expect(p?.id).toBe('ChIJ_joes');
    expect(p?.lat).toBe(40.7549);
    expect(p?.rating).toBe(4.5);
    expect(p?.address).toBe('1435 Broadway, New York, NY 10018');
  });

  it('drops a row with no title and no coords', () => {
    expect(normalizePlace({})).toBeNull();
  });

  it('rejects out-of-range coords (→ null) but keeps the titled place', () => {
    const p = normalizePlace({ title: 'Somewhere', gps_coordinates: { latitude: 200, longitude: 0 } });
    expect(p?.lat).toBeNull();
    expect(p?.title).toBe('Somewhere');
  });
});

describe('normalizePlaces', () => {
  it('maps local_results and de-dupes by id', () => {
    const res: SerpMapsResponse = {
      local_results: [
        { title: 'A', place_id: 'x', gps_coordinates: { latitude: 1, longitude: 2 } },
        { title: 'A again', place_id: 'x', gps_coordinates: { latitude: 1, longitude: 2 } },
        { title: 'B', place_id: 'y', gps_coordinates: { latitude: 3, longitude: 4 } },
      ],
    };
    const out = normalizePlaces(res);
    expect(out.map((p) => p.id)).toEqual(['x', 'y']);
  });

  it('falls back to place_results for a single-place response', () => {
    const res: SerpMapsResponse = { place_results: { title: 'Solo', place_id: 'z', gps_coordinates: { latitude: 5, longitude: 6 } } };
    expect(normalizePlaces(res)).toHaveLength(1);
  });

  it('returns [] for an empty response', () => {
    expect(normalizePlaces({})).toEqual([]);
  });
});

describe('Google Maps deep-links', () => {
  it('place link uses coords when present', () => {
    expect(buildPlaceLink(1.49, 103.74, 'x')).toBe('https://www.google.com/maps/search/?api=1&query=1.49,103.74');
  });
  it('place link falls back to encoded address', () => {
    expect(buildPlaceLink(null, null, 'Tesco JB')).toBe('https://www.google.com/maps/search/?api=1&query=Tesco%20JB');
  });
  it('directions link targets the drop-off for driving', () => {
    expect(buildDirectionsLink(1.49, 103.74, null)).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=1.49,103.74&travelmode=driving',
    );
  });
});

describe('lngLatToTile', () => {
  it('projects (0,0) to the tile seam at z=1', () => {
    const t = lngLatToTile(0, 0, 1);
    expect(t).toMatchObject({ z: 1, x: 1, y: 1 });
    expect(t.fracX).toBeCloseTo(0);
    expect(t.fracY).toBeCloseTo(0);
  });
});

describe('placeSearchSchema', () => {
  it('coerces string querystring numbers', () => {
    const parsed = placeSearchSchema.safeParse({ q: 'tesco', lat: '1.49', lng: '103.74', zoom: '14' });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.lat).toBe(1.49);
  });
  it('rejects a too-short query', () => {
    expect(placeSearchSchema.safeParse({ q: 'ab' }).success).toBe(false);
  });
});
