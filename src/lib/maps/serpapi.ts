import 'server-only';
import { MAPS_COUNTRY, MAPS_LIMITS } from './config';
import type { SerpMapsResponse } from './types';

// Low-level SerpApi Google Maps client. SERVER-ONLY: the API key is read from
// `process.env.SERPAPI_API_KEY` and never reaches the browser (the picker calls
// our own /api/maps/* routes, which call this). Endpoint + params follow the
// Google Maps engine docs: engine=google_maps, q, ll=@lat,lng,zoom, hl, gl.

const ENDPOINT = 'https://serpapi.com/search.json';

/** Thrown for any non-OK upstream condition; carries a domain error `code`. */
export class SerpApiError extends Error {
  constructor(
    public code: 'maps_unconfigured' | 'maps_upstream',
    message: string,
  ) {
    super(message);
    this.name = 'SerpApiError';
  }
}

/** True when a SerpApi key is present — lets callers degrade gracefully. */
export function serpApiConfigured(): boolean {
  return Boolean(process.env.SERPAPI_API_KEY);
}

export interface SerpMapsParams {
  q: string;
  /** `@lat,lng,zoom` origin string (built via normalize.buildLL). */
  ll?: string;
  /** UI language for Google Maps labels. */
  hl?: string;
}

/** Call the SerpApi Google Maps engine and return the parsed JSON. Times out
 *  via AbortController so a hung upstream can't pin a serverless invocation. */
export async function serpGoogleMaps(params: SerpMapsParams): Promise<SerpMapsResponse> {
  const key = process.env.SERPAPI_API_KEY;
  if (!key) throw new SerpApiError('maps_unconfigured', 'SERPAPI_API_KEY is not set');

  const url = new URL(ENDPOINT);
  url.searchParams.set('engine', 'google_maps');
  url.searchParams.set('type', 'search');
  url.searchParams.set('q', params.q);
  if (params.ll) url.searchParams.set('ll', params.ll);
  url.searchParams.set('hl', params.hl ?? 'en');
  url.searchParams.set('gl', MAPS_COUNTRY);
  url.searchParams.set('api_key', key);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MAPS_LIMITS.requestTimeoutMs);
  let res: Response;
  try {
    res = await fetch(url, { signal: controller.signal, headers: { accept: 'application/json' } });
  } catch (e) {
    throw new SerpApiError('maps_upstream', e instanceof Error ? e.message : 'fetch failed');
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) throw new SerpApiError('maps_upstream', `SerpApi HTTP ${res.status}`);

  let json: SerpMapsResponse;
  try {
    json = (await res.json()) as SerpMapsResponse;
  } catch {
    throw new SerpApiError('maps_upstream', 'SerpApi returned non-JSON');
  }
  if (json.error) throw new SerpApiError('maps_upstream', json.error);
  return json;
}
