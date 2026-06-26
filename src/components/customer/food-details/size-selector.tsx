'use client';
import { useState } from 'react';
import { SelectChip } from '@/components/ui';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// Size selector — VISUAL ONLY. It never touches price or the cart (CartLine has no
// variant and unit_price is frozen at add-time). The flat shawarma menu has no sizes,
// so `sizes` defaults to empty and the section renders NOTHING — we never hardcode
// user-facing size strings. It is ready to light up if #03 ever adds `size_*` dict
// values and the caller passes them in.
export function SizeSelector({ t, sizes = [] }: { t: Dictionary; sizes?: string[] }) {
  const [selected, setSelected] = useState(0);
  if (sizes.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-label uppercase text-muted">{t.size}</h2>
      <div className="flex flex-wrap gap-3">
        {sizes.map((s, i) => (
          <SelectChip key={s} selected={i === selected} onSelect={() => setSelected(i)}>
            {s}
          </SelectChip>
        ))}
      </div>
    </section>
  );
}
