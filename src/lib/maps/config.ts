// Google Maps (SerpApi) integration — shared, browser-safe constants.
//
// Pure config only: NO secrets and NO `server-only` import, so this is safe to
// import from client components (the place-search picker needs the default map
// centre) AND from server code. The SerpApi key itself lives only in
// `serpapi.ts` (server) behind `process.env.SERPAPI_API_KEY` — never here.

/** Default search origin when the browser has no geolocation fix yet.
 *  Johor Bahru city centre (the app's trading area — Johor, Malaysia). */
export const DEFAULT_MAP_CENTER = {
  lat: Number(process.env.NEXT_PUBLIC_MAP_DEFAULT_LAT ?? 1.4927),
  lng: Number(process.env.NEXT_PUBLIC_MAP_DEFAULT_LNG ?? 103.7414),
} as const;

/** Map zoom used for the `ll` search origin and the static preview. SerpApi's
 *  `z` ranges 3 (whole world) … 21+; 14 ≈ a neighbourhood, right for delivery. */
export const DEFAULT_MAP_ZOOM = 14;

/** Locale/region passed to Google Maps via SerpApi (`hl` / `gl`). Malaysia. */
export const MAPS_COUNTRY = 'my';
export function mapsLanguage(locale: 'en' | 'ar'): string {
  return locale === 'ar' ? 'ar' : 'en';
}

/** Guardrails for the free SerpApi tier (250 searches/month). */
export const MAPS_LIMITS = {
  /** Ignore queries shorter than this (avoids burning quota on 1–2 chars). */
  minQueryLength: 3,
  /** Trim normalised results to keep payloads + the UI list tight. */
  maxResults: 12,
  /** Server-side cache TTL for an identical (query, ll) search. */
  cacheTtlMs: 5 * 60_000,
  /** Upstream request timeout. */
  requestTimeoutMs: 9_000,
} as const;
