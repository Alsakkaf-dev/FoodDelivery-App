'use client';
import type { Zone } from '@/types/db';
import { EmptyState } from '@/components/ui/states';

// SCR-C-05 step 1 — active-zone selector (US-015 / FR-C-07). The server page
// sources zones via `listZones(true)`, so every zone here is already active;
// picking one sets the checkout draft `zone_id`. Radio rows, ≥44px tap targets,
// RTL-safe via logical `text-start`. Bilingual inline (matches the other
// customer screens — see BUILD/PROGRESS.md task 1-4 note).
export function ZonePicker({
  zones,
  value,
  onChange,
  lang,
}: {
  zones: Zone[];
  value: string | null;
  onChange: (zoneId: string) => void;
  lang: 'en' | 'ar';
}) {
  const ar = lang === 'ar';

  // Empty state — delivery is effectively closed when no zone is active.
  if (zones.length === 0) {
    return (
      <EmptyState
        icon="📍"
        title={ar ? 'التوصيل مغلق حالياً' : 'Delivery is closed right now'}
        hint={
          ar
            ? 'لا توجد مناطق توصيل مفعّلة. اختر الاستلام من المحل بدلاً من ذلك.'
            : 'No delivery zones are active. Choose Walk-in / Pickup instead.'
        }
      />
    );
  }

  return (
    <fieldset>
      <legend className="mb-2 font-semibold text-slate">
        {ar ? 'اختر منطقة التوصيل' : 'Choose delivery zone'}
      </legend>
      <div className="flex flex-col gap-2" role="radiogroup" aria-label={ar ? 'منطقة التوصيل' : 'Delivery zone'}>
        {zones.map((z) => {
          const selected = z.id === value;
          return (
            <button
              key={z.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(z.id)}
              className={`flex min-h-tap w-full items-center gap-3 rounded-control border px-3 py-2 text-start transition ${
                selected ? 'border-rust bg-rust-soft' : 'border-line bg-white hover:bg-cream'
              }`}
            >
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                  selected ? 'border-rust' : 'border-line'
                }`}
                aria-hidden
              >
                {selected ? <span className="h-2.5 w-2.5 rounded-full bg-rust" /> : null}
              </span>
              <span className="font-medium text-slate">{z.name}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
