'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FilledInput, PrimaryButton, Chip, SelectTile, EmptyState } from '@/components/ui';
import { createAddress } from '@/lib/domain/addresses';
import { addressSchema } from '@/lib/utils/schemas';
import type { Address, Zone } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { AddressMapField } from './address-map-field';
import { addressKind, type AddressKind } from './address-card';

// Add/Edit Address form (account lane — distinct from #11's checkout address
// step; both consume the frozen createAddress + addressSchema, neither edits the
// other's file). The design's ADDRESS/STREET/POST CODE/APARTMENT fields are
// presentational sub-parts composed into the schema's single `line1`; LABEL-AS
// maps to `label`; an active delivery zone supplies the required `zone_id`
// (auto-selected when there is only one). CREATE writes for real; EDIT is an
// optimistic preview (no updateAddress backend yet — see TEAM_STATUS.md).
export function AccountAddressForm({
  t,
  zones,
  initial,
  onDone,
}: {
  t: Dictionary;
  zones: Zone[];
  initial?: Address;
  onDone?: (a: Address) => void;
}) {
  const router = useRouter();
  const editing = Boolean(initial);
  const [address, setAddress] = useState(initial?.line1 ?? '');
  const [street, setStreet] = useState('');
  const [postcode, setPostcode] = useState('');
  const [apartment, setApartment] = useState('');
  const [kind, setKind] = useState<AddressKind>(addressKind(initial?.label ?? null));
  const [customLabel, setCustomLabel] = useState(addressKind(initial?.label ?? null) === 'other' ? initial?.label ?? '' : '');
  const [zoneId, setZoneId] = useState<string | null>(initial?.zone_id ?? (zones.length === 1 ? zones[0]?.id ?? null : null));
  const [lat, setLat] = useState<number | null>(initial?.pin_lat ?? null);
  const [lng, setLng] = useState<number | null>(initial?.pin_lng ?? null);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function useMyLocation() {
    setError(null);
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError(t.location_denied);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Number(pos.coords.latitude.toFixed(6)));
        setLng(Number(pos.coords.longitude.toFixed(6)));
        setLocating(false);
      },
      () => {
        setError(t.location_denied);
        setLocating(false);
      },
    );
  }

  function labelValue(): string {
    if (kind === 'home') return t.label_home;
    if (kind === 'work') return t.label_work;
    return customLabel.trim() || t.label_other;
  }

  function done(addr: Address) {
    if (onDone) onDone(addr);
    else {
      router.push('/account/addresses');
      router.refresh();
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!zoneId) {
      setError(t.choose_zone_first);
      return;
    }
    const line1 = [address, street, apartment, postcode].map((s) => s.trim()).filter(Boolean).join(', ').slice(0, 200);
    const input = { zone_id: zoneId, line1, label: labelValue(), pin_lat: lat, pin_lng: lng };
    const parsed = addressSchema.safeParse(input);
    if (!parsed.success) {
      setError(t.address_incomplete);
      return;
    }
    setSaving(true);
    if (editing) {
      // Optimistic preview — no updateAddress server action exists yet.
      setSaving(false);
      done({ ...(initial as Address), ...parsed.data });
      return;
    }
    const res = await createAddress(parsed.data);
    setSaving(false);
    if (!res.ok) {
      setError(t.address_save_failed);
      return;
    }
    done(res.data);
  }

  if (zones.length === 0) {
    return <EmptyState icon="map-pin" title={t.delivery_closed} hint={t.choose_zone} />;
  }

  const labelChips: { kind: AddressKind; label: string }[] = [
    { kind: 'home', label: t.label_home },
    { kind: 'work', label: t.label_work },
    { kind: 'other', label: t.label_other },
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <AddressMapField
        hint={t.move_to_edit_location}
        useLocationLabel={t.use_my_location}
        locating={locating}
        located={lat !== null && lng !== null}
        onUseLocation={useMyLocation}
      />

      <FilledInput label={t.field_address} trailingIcon="map-pin" value={address} onChange={(e) => setAddress(e.target.value)} />

      <div className="grid grid-cols-2 gap-3">
        <FilledInput label={t.addr_street} value={street} onChange={(e) => setStreet(e.target.value)} />
        <FilledInput label={t.addr_postcode} inputMode="numeric" value={postcode} onChange={(e) => setPostcode(e.target.value)} />
      </div>

      <FilledInput label={t.addr_apartment} value={apartment} onChange={(e) => setApartment(e.target.value)} />

      <fieldset>
        <legend className="mb-2 text-label uppercase text-muted">{t.label_as}</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t.label_as}>
          {labelChips.map((c) => (
            <Chip key={c.kind} role="radio" selected={kind === c.kind} onToggle={() => setKind(c.kind)}>
              {c.label}
            </Chip>
          ))}
        </div>
        {kind === 'other' ? (
          <div className="mt-3">
            <FilledInput label={t.label_as} value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} />
          </div>
        ) : null}
      </fieldset>

      {zones.length > 1 ? (
        <fieldset>
          <legend className="mb-2 text-label uppercase text-muted">{t.delivery_area}</legend>
          <div className="space-y-2" role="radiogroup" aria-label={t.delivery_area}>
            {zones.map((z) => (
              <SelectTile key={z.id} role="radio" title={z.name} selected={zoneId === z.id} onSelect={() => setZoneId(z.id)} />
            ))}
          </div>
        </fieldset>
      ) : null}

      {error ? (
        <p role="alert" className="text-body font-medium text-danger">
          {error}
        </p>
      ) : null}

      <PrimaryButton type="submit" fullWidth loading={saving}>
        {t.save_location}
      </PrimaryButton>
    </form>
  );
}
