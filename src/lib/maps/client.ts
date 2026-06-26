// Browser helper to call our same-origin maps search route. Keeps fetch/URL
// wiring out of the components and returns the app's standard envelope.

import type { ApiResult } from '@/lib/utils/api';
import type { PlaceResult } from './types';

export interface SearchOrigin {
  lat: number | null;
  lng: number | null;
  zoom?: number;
}

/** Query /api/maps/search. `signal` lets the caller cancel a stale keystroke. */
export async function searchPlacesClient(
  q: string,
  origin: SearchOrigin,
  signal?: AbortSignal,
): Promise<ApiResult<PlaceResult[]>> {
  const params = new URLSearchParams({ q });
  if (origin.lat !== null) params.set('lat', String(origin.lat));
  if (origin.lng !== null) params.set('lng', String(origin.lng));
  if (origin.zoom) params.set('zoom', String(origin.zoom));

  try {
    const res = await fetch(`/api/maps/search?${params.toString()}`, {
      signal,
      headers: { accept: 'application/json' },
    });
    const json = (await res.json()) as ApiResult<PlaceResult[]>;
    return json;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      return { ok: false, error: { code: 'aborted', message: 'aborted' } };
    }
    return { ok: false, error: { code: 'maps_upstream', message: 'network' } };
  }
}
