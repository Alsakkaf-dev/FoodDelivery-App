// Pure transforms for the Google Maps (SerpApi) integration — no I/O, no
// `server-only`, fully unit-testable (tests/unit/maps.test.ts).

import { MAPS_LIMITS } from './config';
import type { PlaceResult, SerpLocalResult, SerpMapsResponse } from './types';

/** Build SerpApi's `ll` search-origin string: `@lat,lng,<zoom>z`.
 *  Coordinates are clamped to valid ranges and trimmed to 6 dp (~0.1 m). */
export function buildLL(lat: number, lng: number, zoom: number): string {
  const la = clamp(lat, -90, 90).toFixed(6);
  const ln = clamp(lng, -180, 180).toFixed(6);
  const z = Math.round(clamp(zoom, 3, 21));
  return `@${la},${ln},${z}z`;
}

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function toCoord(value: number | undefined, min: number, max: number): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  if (value < min || value > max) return null;
  return Number(value.toFixed(6));
}

/** Map one raw SerpApi local result → a normalised PlaceResult (or null if it
 *  carries nothing useful, e.g. no title and no coordinates). */
export function normalizePlace(raw: SerpLocalResult): PlaceResult | null {
  const title = (raw.title ?? '').trim();
  const lat = toCoord(raw.gps_coordinates?.latitude, -90, 90);
  const lng = toCoord(raw.gps_coordinates?.longitude, -180, 180);
  if (!title && lat === null && lng === null) return null;

  const id =
    raw.place_id?.trim() ||
    raw.data_id?.trim() ||
    `${title}@${lat ?? '?'},${lng ?? '?'}`;

  return {
    id,
    title: title || (raw.address ?? '').trim() || id,
    address: raw.address?.trim() || null,
    lat,
    lng,
    type: raw.type?.trim() || null,
    rating: typeof raw.rating === 'number' && raw.rating >= 0 && raw.rating <= 5 ? raw.rating : null,
  };
}

/** Normalise a full SerpApi `google_maps` response into a capped, de-duped list. */
export function normalizePlaces(res: SerpMapsResponse): PlaceResult[] {
  const rows: SerpLocalResult[] = res.local_results ?? (res.place_results ? [res.place_results] : []);
  const out: PlaceResult[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    const place = normalizePlace(row);
    if (!place || seen.has(place.id)) continue;
    seen.add(place.id);
    out.push(place);
    if (out.length >= MAPS_LIMITS.maxResults) break;
  }
  return out;
}
