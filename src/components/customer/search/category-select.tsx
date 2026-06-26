'use client';
import { useState } from 'react';
import { BottomSheet, Chip } from '@/components/ui';
import { Icon } from '@/components/icons';
import { CATEGORIES } from './filters';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// The "BURGER ▾" header selector from the category listing. Fahman has no
// `category` column, so the options are the curated brand buckets (cat_* keys);
// picking one re-filters the grid by name match. Opens a small BottomSheet (the
// app's standard overlay) of selectable Chips. `chevron-down` does not mirror.
export function CategorySelect({
  value,
  onSelect,
  t,
}: {
  value: string;
  onSelect: (id: string) => void;
  t: Dictionary;
}) {
  const [open, setOpen] = useState(false);
  const current = CATEGORIES.find((c) => c.id === value) ?? CATEGORIES[0];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex min-h-tap items-center gap-1 rounded-pill px-3 text-headerTitle font-bold uppercase text-ink"
      >
        {t[current.key] as string}
        <Icon name="chevron-down" className="text-muted" aria-hidden />
      </button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title={t.categories}>
        <div className="flex flex-wrap gap-3 pb-2">
          {CATEGORIES.map((c) => (
            <Chip
              key={c.id}
              selected={c.id === value}
              onToggle={() => {
                onSelect(c.id);
                setOpen(false);
              }}
            >
              {t[c.key] as string}
            </Chip>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}
