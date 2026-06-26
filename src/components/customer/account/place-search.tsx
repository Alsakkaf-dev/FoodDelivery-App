'use client';
// Delivery-point search — the competitive heart of the maps feature. The
// customer types a landmark, mall, street or area; we query Google Maps (via our
// same-origin /api/maps/search → SerpApi) biased to their current location and
// list real places with exact coordinates. Picking one fills the address form's
// line + pin, so the rider gets a precise drop-off instead of a rough guess.
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/icons';
import { searchPlacesClient } from '@/lib/maps/client';
import { MAPS_LIMITS, DEFAULT_MAP_ZOOM } from '@/lib/maps/config';
import type { PlaceResult, PlaceSelection } from '@/lib/maps/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';

type Status = 'idle' | 'searching' | 'results' | 'empty' | 'error' | 'unavailable';

export function PlaceSearch({
  t,
  onSelect,
}: {
  t: Dictionary;
  onSelect: (sel: PlaceSelection) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const originRef = useRef<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });

  // Best-effort: bias results to the user's location (server falls back to the
  // Johor default if this never resolves). Silent — never blocks typing.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        originRef.current = {
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        };
      },
      () => {},
      { timeout: 8000, maximumAge: 300_000 },
    );
  }, []);

  // Debounced search with stale-response cancellation.
  useEffect(() => {
    const q = query.trim();
    if (q.length < MAPS_LIMITS.minQueryLength) {
      setStatus('idle');
      setResults([]);
      return;
    }
    setStatus('searching');
    const controller = new AbortController();
    const id = setTimeout(async () => {
      const res = await searchPlacesClient(q, { ...originRef.current, zoom: DEFAULT_MAP_ZOOM }, controller.signal);
      if (controller.signal.aborted) return;
      if (!res.ok) {
        if (res.error.code === 'aborted') return;
        setStatus(res.error.code === 'maps_unconfigured' ? 'unavailable' : 'error');
        setResults([]);
        return;
      }
      setResults(res.data);
      setStatus(res.data.length ? 'results' : 'empty');
    }, 350);
    return () => {
      clearTimeout(id);
      controller.abort();
    };
  }, [query]);

  function choose(p: PlaceResult) {
    if (p.lat === null || p.lng === null) return;
    onSelect({ title: p.title, address: p.address, lat: p.lat, lng: p.lng });
    setQuery(p.title);
    setResults([]);
    setStatus('idle');
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-pill bg-surface-alt px-4 min-h-tap">
        <Icon name="search" className="h-5 w-5 shrink-0 text-muted" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.place_search_placeholder}
          aria-label={t.search_location}
          className="w-full bg-transparent py-2 text-body text-ink outline-none placeholder:text-muted"
          autoComplete="off"
        />
        {status === 'searching' ? (
          <Icon name="refresh" className="h-4 w-4 shrink-0 animate-spin text-brand" aria-hidden />
        ) : query ? (
          <button type="button" onClick={() => setQuery('')} aria-label={t.clear} className="shrink-0 text-muted">
            <Icon name="close" className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>

      {status === 'results' ? (
        <ul className="overflow-hidden rounded-lg border border-line bg-surface shadow-card" role="listbox" aria-label={t.search_location}>
          {results.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => choose(p)}
                disabled={p.lat === null || p.lng === null}
                className="flex w-full items-start gap-3 border-b border-line/60 px-4 py-3 text-start transition last:border-0 hover:bg-surface-alt active:bg-surface-alt disabled:opacity-50"
              >
                <Icon name="map-pin" className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body font-semibold text-ink">{p.title}</span>
                  {p.address ? <span className="block truncate text-caption text-muted">{p.address}</span> : null}
                  {p.type ? (
                    <span className="mt-0.5 inline-flex items-center gap-1 text-caption text-muted">
                      {p.type}
                      {p.rating !== null ? (
                        <span className="inline-flex items-center gap-0.5 text-brand">
                          <Icon name="star-filled" className="h-3 w-3" aria-hidden />
                          {p.rating.toFixed(1)}
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {status === 'empty' ? <p className="px-1 text-caption text-muted">{t.no_places_found}</p> : null}
      {status === 'error' ? <p className="px-1 text-caption text-danger" role="alert">{t.search_error}</p> : null}
      {status === 'unavailable' ? <p className="px-1 text-caption text-muted">{t.maps_unavailable}</p> : null}
    </div>
  );
}
