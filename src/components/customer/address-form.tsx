'use client';
import { useState } from 'react';
import type { Address } from '@/types/db';
import { addressSchema } from '@/lib/utils/schemas';
import { createAddress } from '@/lib/domain/addresses';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { Icon, type IconName } from '@/components/icons';
import { MapIllustration } from '@/components/brand';
import { Chip, FilledInput, IconChip, ListRow, OutlineButton, PrimaryButton, TextAction } from '@/components/ui';
import type { PlaceSelection } from '@/lib/maps/types';
import { PlaceSearch } from '@/components/customer/account/place-search';
import { StaticMap } from '@/components/customer/account/static-map';

// SCR-C-05 step 1 — delivery address entry/save + saved-address reuse
// (US-015 / FR-C-07). Saving goes through the `createAddress` server action,
// which re-validates with `addressSchema` (the only write path). The structured
// fields (address/street/postcode/apartment) are composed into the single frozen
// `line1` (the DB stores only line1 + label + pin). An optional map pin can be
// filled from `navigator.geolocation` — no paid map API.

// Free-text `label` → display glyph (display-only; never alters the stored value).
function labelGlyph(label: string | null): { icon: IconName; tone: 'info.blue' | 'info.purple' | 'brand' } {
  const l = (label ?? '').toLowerCase();
  if (/home|house|منزل|بيت/.test(l)) return { icon: 'home-address', tone: 'info.blue' };
  if (/work|office|عمل|مكتب|دوام/.test(l)) return { icon: 'briefcase', tone: 'info.purple' };
  return { icon: 'map-pin', tone: 'brand' };
}

const LABELS: Array<{ value: string; key: 'label_home' | 'label_work' | 'label_other' }> = [
  { value: 'Home', key: 'label_home' },
  { value: 'Work', key: 'label_work' },
  { value: 'Other', key: 'label_other' },
];

export function AddressForm({
  addresses,
  zoneId,
  value,
  onChange,
  lang,
}: {
  addresses: Address[];
  zoneId: string | null;
  value: string | null;
  onChange: (addressId: string) => void;
  lang: 'en' | 'ar';
}) {
  const t = getDictionary(lang);
  const [saved, setSaved] = useState<Address[]>(addresses);
  const [adding, setAdding] = useState(addresses.length === 0);
  const [addressLine, setAddressLine] = useState('');
  const [street, setStreet] = useState('');
  const [postcode, setPostcode] = useState('');
  const [apartment, setApartment] = useState('');
  const [label, setLabel] = useState<string | null>(null);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [placeTitle, setPlaceTitle] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compose the structured fields into the one frozen `line1` column.
  function composeLine1(): string {
    const parts = [addressLine, street, apartment].map((s) => s.trim()).filter(Boolean);
    let line1 = parts.join(', ');
    const pc = postcode.trim();
    if (pc) line1 = line1 ? `${line1} ${pc}` : pc;
    return line1;
  }

  // A Google Maps pick fills the address line + exact pin in one tap.
  function handlePlace(sel: PlaceSelection) {
    setError(null);
    setAddressLine(sel.address ?? sel.title);
    setLat(String(sel.lat));
    setLng(String(sel.lng));
    setPlaceTitle(sel.title);
  }

  function useMyLocation() {
    setError(null);
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError(t.location_denied);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => {
        setError(t.location_denied);
        setLocating(false);
      },
    );
  }

  async function save() {
    setError(null);
    if (!zoneId) {
      setError(t.choose_zone_first);
      return;
    }
    const input = {
      zone_id: zoneId,
      line1: composeLine1(),
      label: label,
      pin_lat: lat ? Number(lat) : null,
      pin_lng: lng ? Number(lng) : null,
    };
    const parsed = addressSchema.safeParse(input);
    if (!parsed.success) {
      setError(t.address_incomplete);
      return;
    }
    setSaving(true);
    const res = await createAddress(parsed.data);
    setSaving(false);
    if (!res.ok) {
      setError(t.address_save_failed);
      return;
    }
    setSaved((prev) => [...prev, res.data]);
    onChange(res.data.id);
    setAddressLine('');
    setStreet('');
    setPostcode('');
    setApartment('');
    setLabel(null);
    setLat('');
    setLng('');
    setAdding(false);
  }

  const hasPin = Boolean(lat && lng);
  const canSave = composeLine1().length >= 3;

  return (
    <div className="space-y-4">
      <h3 className="text-h2 font-bold text-ink">{t.address}</h3>

      {/* Saved-address reuse — one tap selects a prior address (with its pin). */}
      {saved.length > 0 ? (
        <div className="space-y-2">
          {saved.map((a) => {
            const g = labelGlyph(a.label);
            return (
              <ListRow
                key={a.id}
                selectable
                selected={a.id === value}
                onClick={() => onChange(a.id)}
                leading={<IconChip icon={g.icon} tone={g.tone} />}
                title={a.label ?? t.field_address}
                subtitle={a.line1}
              />
            );
          })}
        </div>
      ) : null}

      {!adding ? (
        <OutlineButton dashed fullWidth leadingIcon="plus" onClick={() => setAdding(true)}>
          {t.add_new_address}
        </OutlineButton>
      ) : (
        <div className="space-y-4 rounded-lg border border-line bg-surface p-4 shadow-card">
          {/* Search a place/landmark → exact pin (Google Maps via SerpApi). */}
          <PlaceSearch t={t} onSelect={handlePlace} />

          {/* Real preview once a pin exists; else the geolocation priming panel. */}
          {hasPin ? (
            <StaticMap lat={Number(lat)} lng={Number(lng)} title={placeTitle} viewLabel={t.view_on_map} />
          ) : (
            <div className="relative overflow-hidden rounded-lg bg-surface-alt">
              <button
                type="button"
                onClick={useMyLocation}
                disabled={locating}
                aria-label={t.access_location}
                className="block w-full"
              >
                <MapIllustration className="h-32 w-full object-cover" />
              </button>
              <span className="pointer-events-none absolute inset-x-0 bottom-2 mx-auto flex w-max items-center gap-1 rounded-pill bg-dark-cta/85 px-3 py-1 text-caption font-semibold text-onColor backdrop-blur">
                <Icon name="map-pin" className="h-3.5 w-3.5" aria-hidden />
                {locating ? t.locating : t.move_to_edit_location}
              </span>
            </div>
          )}
          <p className="text-caption text-muted">{t.location_usage_note}</p>

          <FilledInput
            label={t.field_address}
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            autoComplete="address-line1"
          />
          <div className="flex gap-3">
            <FilledInput containerClassName="flex-1" label={t.field_street} value={street} onChange={(e) => setStreet(e.target.value)} autoComplete="address-line2" />
            <FilledInput containerClassName="flex-1" label={t.field_postcode} value={postcode} onChange={(e) => setPostcode(e.target.value)} inputMode="numeric" dir="ltr" autoComplete="postal-code" />
          </div>
          <FilledInput label={t.field_apartment} value={apartment} onChange={(e) => setApartment(e.target.value)} />

          {/* LABEL AS pills → the frozen `label` field. */}
          <div>
            <p className="mb-2 text-label font-semibold uppercase tracking-wide text-muted">{t.label_as}</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label={t.label_as}>
              {LABELS.map((opt) => (
                <Chip
                  key={opt.value}
                  selected={label === opt.value}
                  onToggle={() => setLabel(label === opt.value ? null : opt.value)}
                >
                  {t[opt.key]}
                </Chip>
              ))}
            </div>
          </div>

          {/* Use-my-location action + manual pin confirmation (geolocation-denied fallback). */}
          <div className="flex items-center justify-between gap-2">
            <TextAction tone="brand" trailingIcon="navigation" onClick={useMyLocation} disabled={locating}>
              {locating ? t.locating : t.use_my_location}
            </TextAction>
            {hasPin ? (
              <span className="inline-flex items-center gap-1 text-caption text-success" dir="ltr">
                <Icon name="check-circle" className="h-4 w-4" aria-hidden />
                {lat}, {lng}
              </span>
            ) : null}
          </div>

          {error ? (
            <p className="text-sm font-medium text-danger" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex gap-3">
            <PrimaryButton fullWidth loading={saving} disabled={!canSave} onClick={save}>
              {t.save_location}
            </PrimaryButton>
            {saved.length > 0 ? (
              <OutlineButton onClick={() => { setAdding(false); setError(null); }}>
                {t.cancel}
              </OutlineButton>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
