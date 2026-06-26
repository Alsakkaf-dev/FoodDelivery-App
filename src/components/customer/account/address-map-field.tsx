import { Icon } from '@/components/icons';

// Decorative location picker for Add/Edit Address. There is NO paid map API in
// this app (the checkout address-form uses the same approach), so this is a
// stylized, token-only basemap with a centered pin + a "move to edit" hint and a
// "use my location" affordance. The real pin (pin_lat/pin_lng) is captured via
// navigator.geolocation by the parent form; this stays presentational.
export function AddressMapField({
  hint,
  useLocationLabel,
  locating,
  located,
  onUseLocation,
}: {
  hint: string;
  useLocationLabel: string;
  locating: boolean;
  located: boolean;
  onUseLocation: () => void;
}) {
  return (
    <div className="relative h-48 overflow-hidden rounded-2xl bg-bg-canvas">
      {/* abstract map shapes (token tints only — no hardcoded colors) */}
      <div className="absolute -start-6 top-6 h-16 w-28 rotate-12 rounded-pill bg-brand-faint" aria-hidden />
      <div className="absolute end-4 top-4 h-20 w-20 rounded-3xl bg-surface" aria-hidden />
      <div className="absolute bottom-3 start-8 h-14 w-32 -rotate-6 rounded-pill bg-surface-alt" aria-hidden />
      <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 bg-surface/70" aria-hidden />

      {/* center pin + pulse */}
      <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2">
        <span className="rounded-pill bg-dark-cta px-3 py-1 text-caption font-medium text-onColor shadow-card">{hint}</span>
        <span className="relative grid h-9 w-9 place-items-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-brand/30" aria-hidden />
          <span className="relative grid h-9 w-9 place-items-center rounded-full bg-surface text-brand shadow-floating">
            <Icon name="map-pin" />
          </span>
        </span>
      </div>

      {/* use-my-location */}
      <button
        type="button"
        onClick={onUseLocation}
        disabled={locating}
        className="absolute bottom-3 end-3 inline-flex min-h-tap items-center gap-2 rounded-pill bg-surface px-4 text-button font-semibold text-brand shadow-card disabled:opacity-60"
      >
        <Icon name={located ? 'check-circle' : 'navigation'} />
        {locating ? '…' : useLocationLabel}
      </button>
    </div>
  );
}
