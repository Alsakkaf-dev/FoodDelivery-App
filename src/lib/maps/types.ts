// Types for the Google Maps (SerpApi) integration. Browser-safe (types only).

/** A normalised place returned to the app from a Google Maps search.
 *  Decoupled from SerpApi's raw shape so callers/UI never depend on it. */
export interface PlaceResult {
  /** Stable id for React keys / dedupe (place_id ?? data_id ?? title+coords). */
  id: string;
  /** Business / landmark / area name, e.g. "Tesco Taman Universiti". */
  title: string;
  /** Formatted address line, when Google has one. */
  address: string | null;
  /** Exact pin — what we save as `pin_lat` / `pin_lng`. */
  lat: number | null;
  lng: number | null;
  /** Category label, e.g. "Shopping mall" (for the result row subtitle). */
  type: string | null;
  /** 0–5 star rating, when present (helps the user recognise a place). */
  rating: number | null;
};

/** A delivery-point selection emitted by the picker to a form. */
export interface PlaceSelection {
  title: string;
  address: string | null;
  lat: number;
  lng: number;
};

/** Minimal slice of SerpApi's `google_maps` JSON we actually read.
 *  Everything is optional — the API is external and may omit fields. */
export interface SerpGpsCoordinates {
  latitude?: number;
  longitude?: number;
}
export interface SerpLocalResult {
  position?: number;
  title?: string;
  place_id?: string;
  data_id?: string;
  address?: string;
  type?: string;
  rating?: number;
  gps_coordinates?: SerpGpsCoordinates;
}
export interface SerpMapsResponse {
  error?: string;
  search_metadata?: { status?: string };
  local_results?: SerpLocalResult[];
  /** `type=place` single-result responses use `place_results` instead. */
  place_results?: SerpLocalResult;
}
