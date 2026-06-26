import 'server-only';
import { requireRole, RoleError } from '@/lib/auth/roles';
import { ok, fail, type ApiResult } from '@/lib/utils/api';
import { placeSearchSchema } from '@/lib/utils/schemas';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, MAPS_LIMITS } from './config';
import { buildLL, normalizePlaces } from './normalize';
import { serpApiConfigured, serpGoogleMaps, SerpApiError } from './serpapi';
import type { PlaceResult } from './types';

// Domain layer for delivery-point search. Validates input, applies the Johor
// default origin when the browser sent no fix, caches identical lookups to
// protect the free SerpApi tier (250/month), and returns the app's standard
// { ok, data } envelope so route handlers and server components stay uniform.

type CacheEntry = { at: number; data: PlaceResult[] };
const cache = new Map<string, CacheEntry>();

function cacheGet(key: string): PlaceResult[] | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > MAPS_LIMITS.cacheTtlMs) {
    cache.delete(key);
    return null;
  }
  return hit.data;
}

function cacheSet(key: string, data: PlaceResult[]): void {
  // Bound the map so a long-running instance can't grow unbounded.
  if (cache.size > 256) cache.clear();
  cache.set(key, { at: Date.now(), data });
}

/** Search Google Maps for delivery points near an origin. Auth-gated to any
 *  signed-in role (in preview mode every guard passes). */
export async function searchPlaces(
  input: unknown,
  hl: 'en' | 'ar' = 'en',
): Promise<ApiResult<PlaceResult[]>> {
  try {
    await requireRole('customer', 'operator', 'rider');
  } catch (e) {
    return e instanceof RoleError ? fail(e.code, e.code) : fail('internal', 'error');
  }

  const parsed = placeSearchSchema.safeParse(input);
  if (!parsed.success) return fail('validation_error', 'Invalid search', parsed.error.flatten());
  const { q, lat, lng, zoom } = parsed.data;

  if (!serpApiConfigured()) return fail('maps_unconfigured', 'maps_unconfigured');

  const originLat = lat ?? DEFAULT_MAP_CENTER.lat;
  const originLng = lng ?? DEFAULT_MAP_CENTER.lng;
  const ll = buildLL(originLat, originLng, zoom ?? DEFAULT_MAP_ZOOM);

  const key = `${hl}|${q.toLowerCase()}|${ll}`;
  const cached = cacheGet(key);
  if (cached) return ok(cached);

  try {
    const raw = await serpGoogleMaps({ q, ll, hl });
    const places = normalizePlaces(raw);
    cacheSet(key, places);
    return ok(places);
  } catch (e) {
    if (e instanceof SerpApiError) return fail(e.code, e.message);
    return fail('maps_upstream', e instanceof Error ? e.message : 'upstream error');
  }
}
