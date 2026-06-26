// Slippy-map tile math (pure, browser-safe). Shared by the server static-map
// proxy (which tile to fetch) and the client preview (where to drop the marker
// inside that tile). No external map library or key — just the standard
// Web-Mercator projection used by OpenStreetMap/Google tiles.

export interface TileRef {
  z: number;
  x: number;
  y: number;
  /** Marker position inside the tile, 0..1 from the top-left. */
  fracX: number;
  fracY: number;
}

/** Project a coordinate to its containing tile at zoom `z` (clamped 0..19). */
export function lngLatToTile(lat: number, lng: number, zoom: number): TileRef {
  const z = Math.round(Math.min(19, Math.max(0, zoom)));
  const n = 2 ** z;
  const safeLat = Math.min(85.0511, Math.max(-85.0511, lat));
  const xTile = ((lng + 180) / 360) * n;
  const latRad = (safeLat * Math.PI) / 180;
  const yTile = ((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n;
  const x = Math.floor(xTile);
  const y = Math.floor(yTile);
  return { z, x, y, fracX: xTile - x, fracY: yTile - y };
}
