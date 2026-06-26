'use client';
// Real map preview for a chosen delivery point. Renders a single OpenStreetMap
// tile through our same-origin /api/maps/static proxy (no extra key, CSP-clean)
// with an accurately-placed pin. If the tile can't load it degrades to a
// stylised basemap so the form never looks broken.
import { useState } from 'react';
import { Icon } from '@/components/icons';
import { lngLatToTile } from '@/lib/maps/tiles';
import { buildPlaceLink } from '@/lib/maps/links';

const PREVIEW_ZOOM = 16;

export function StaticMap({
  lat,
  lng,
  title,
  viewLabel,
}: {
  lat: number;
  lng: number;
  title?: string | null;
  viewLabel: string;
}) {
  const [failed, setFailed] = useState(false);
  const { fracX, fracY } = lngLatToTile(lat, lng, PREVIEW_ZOOM);
  const src = `/api/maps/static?lat=${lat}&lng=${lng}&z=${PREVIEW_ZOOM}`;

  return (
    <div className="relative h-44 overflow-hidden rounded-2xl bg-bg-canvas">
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- dynamic same-origin tile proxy
        <img
          src={src}
          alt=""
          aria-hidden
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0" aria-hidden>
          <div className="absolute -start-6 top-6 h-16 w-28 rotate-12 rounded-pill bg-brand-faint" />
          <div className="absolute end-4 top-4 h-20 w-20 rounded-3xl bg-surface" />
          <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 bg-surface/70" />
        </div>
      )}

      {/* Accurately-placed pin (left/top are geographic — not mirrored under RTL). */}
      <span
        className="pointer-events-none absolute z-10 grid h-9 w-9 -translate-x-1/2 -translate-y-full place-items-center"
        style={{ left: `${(failed ? 0.5 : fracX) * 100}%`, top: `${(failed ? 0.5 : fracY) * 100}%` }}
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-surface text-brand shadow-floating">
          <Icon name="map-pin" />
        </span>
      </span>

      {title ? (
        <span className="absolute inset-x-3 top-3 z-10 mx-auto flex w-max max-w-[90%] items-center gap-1 rounded-pill bg-dark-cta/85 px-3 py-1 text-caption font-semibold text-onColor backdrop-blur">
          <Icon name="check-circle" className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">{title}</span>
        </span>
      ) : null}

      <a
        href={buildPlaceLink(lat, lng, title ?? null)}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 end-3 z-10 inline-flex min-h-tap items-center gap-2 rounded-pill bg-surface px-4 text-button font-semibold text-brand shadow-card"
      >
        <Icon name="navigation" className="h-4 w-4" aria-hidden />
        {viewLabel}
      </a>
    </div>
  );
}
