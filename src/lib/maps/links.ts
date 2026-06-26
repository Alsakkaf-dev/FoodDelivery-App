// Google Maps deep-links — pure string builders, no I/O, no `server-only`.
// Used by the rider lane (navigate to drop-off) and the customer picker
// ("view on Google Maps"). These open the user's installed Maps app and need
// no API key, so they always work even when SerpApi is unconfigured.

/** A "show this point" link (drops a pin at the coordinate or address). */
export function buildPlaceLink(
  lat: number | null,
  lng: number | null,
  address: string | null,
): string {
  if (lat !== null && lng !== null) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address ?? '')}`;
}

/** A turn-by-turn navigation link to a drop-off (rider "Navigate" button).
 *  Prefers exact coordinates; falls back to the address text. */
export function buildDirectionsLink(
  lat: number | null,
  lng: number | null,
  address: string | null,
): string {
  const dest =
    lat !== null && lng !== null ? `${lat},${lng}` : encodeURIComponent(address ?? '');
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
}
