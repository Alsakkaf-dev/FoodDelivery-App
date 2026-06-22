'use client';
import { useState } from 'react';
import type { Address } from '@/types/db';
import { addressSchema } from '@/lib/utils/schemas';
import { createAddress } from '@/lib/domain/addresses';

// SCR-C-05 step 1 — delivery address entry/save + saved-address reuse
// (US-015 / FR-C-07). Saving goes through the `createAddress` server action,
// which re-validates with `addressSchema` (the only write path). An optional map
// pin can be typed or filled from `navigator.geolocation` — no paid map API.
// Bilingual inline (matches the other customer screens — see PROGRESS task 1-4).
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
  const ar = lang === 'ar';
  const [saved, setSaved] = useState<Address[]>(addresses);
  const [adding, setAdding] = useState(addresses.length === 0);
  const [line1, setLine1] = useState('');
  const [label, setLabel] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function useMyLocation() {
    setError(null);
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError(ar ? 'تحديد الموقع غير متاح على هذا الجهاز.' : 'Location is not available on this device.');
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
        setError(ar ? 'تعذّر الحصول على موقعك. أدخله يدوياً.' : 'Could not get your location. Enter it manually.');
        setLocating(false);
      },
    );
  }

  async function save() {
    setError(null);
    if (!zoneId) {
      setError(ar ? 'اختر منطقة التوصيل أولاً.' : 'Choose a delivery zone first.');
      return;
    }
    const input = {
      zone_id: zoneId,
      line1: line1.trim(),
      label: label.trim() || null,
      pin_lat: lat ? Number(lat) : null,
      pin_lng: lng ? Number(lng) : null,
    };
    const parsed = addressSchema.safeParse(input);
    if (!parsed.success) {
      setError(ar ? 'يرجى إدخال عنوان أكثر اكتمالاً.' : 'Please enter a more complete address.');
      return;
    }
    setSaving(true);
    const res = await createAddress(parsed.data);
    setSaving(false);
    if (!res.ok) {
      setError(ar ? 'تعذّر حفظ العنوان. حاول مرة أخرى.' : 'Could not save the address. Please try again.');
      return;
    }
    setSaved((prev) => [...prev, res.data]);
    onChange(res.data.id);
    setLine1('');
    setLabel('');
    setLat('');
    setLng('');
    setAdding(false);
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate">{ar ? 'العنوان' : 'Address'}</h3>

      {/* Saved-address reuse — one tap selects a prior address (with its pin). */}
      {saved.length > 0 ? (
        <div className="flex flex-col gap-2" role="radiogroup" aria-label={ar ? 'العناوين المحفوظة' : 'Saved addresses'}>
          {saved.map((a) => {
            const selected = a.id === value;
            return (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(a.id)}
                className={`flex min-h-tap w-full items-start gap-3 rounded-control border px-3 py-2 text-start transition ${
                  selected ? 'border-rust bg-rust-soft' : 'border-line bg-white hover:bg-cream'
                }`}
              >
                <span
                  className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                    selected ? 'border-rust' : 'border-line'
                  }`}
                  aria-hidden
                >
                  {selected ? <span className="h-2.5 w-2.5 rounded-full bg-rust" /> : null}
                </span>
                <span className="min-w-0">
                  {a.label ? <span className="block font-medium text-slate">{a.label}</span> : null}
                  <span className="block text-sm text-muted">{a.line1}</span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {!adding ? (
        <button type="button" className="btn-secondary w-full" onClick={() => setAdding(true)}>
          {ar ? 'أضف عنواناً جديداً' : 'Add a new address'}
        </button>
      ) : (
        <div className="space-y-3 rounded-card border border-line p-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate">{ar ? 'العنوان الكامل' : 'Full delivery address'}</span>
            <textarea
              className="field"
              rows={2}
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              placeholder={ar ? 'مثال: رقم ١٢، شارع بولاي ١، تامان بولاي سبرينغ' : 'e.g. No. 12, Jalan Pulai 1, Taman Pulai Spring'}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate">{ar ? 'تسمية (اختياري)' : 'Label (optional)'}</span>
            <input
              className="field"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={ar ? 'المنزل، العمل…' : 'Home, Work…'}
            />
          </label>

          <fieldset>
            <legend className="mb-1 text-sm font-medium text-slate">{ar ? 'تحديد الموقع على الخريطة (اختياري)' : 'Map pin (optional)'}</legend>
            <div className="flex gap-2">
              <input
                className="field"
                inputMode="decimal"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder={ar ? 'خط العرض' : 'Latitude'}
                aria-label={ar ? 'خط العرض' : 'Latitude'}
              />
              <input
                className="field"
                inputMode="decimal"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder={ar ? 'خط الطول' : 'Longitude'}
                aria-label={ar ? 'خط الطول' : 'Longitude'}
              />
            </div>
            <button type="button" className="btn-ghost mt-2 w-full" onClick={useMyLocation} disabled={locating}>
              {locating ? (ar ? 'جارٍ التحديد…' : 'Locating…') : ar ? '📍 استخدم موقعي الحالي' : '📍 Use my location'}
            </button>
          </fieldset>

          {error ? (
            <p className="text-sm font-medium text-rust" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex gap-2">
            <button type="button" className="btn-primary flex-1" onClick={save} disabled={saving || line1.trim().length === 0}>
              {saving ? (ar ? 'جارٍ الحفظ…' : 'Saving…') : ar ? 'حفظ العنوان' : 'Save address'}
            </button>
            {saved.length > 0 ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setAdding(false);
                  setError(null);
                }}
              >
                {ar ? 'إلغاء' : 'Cancel'}
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
