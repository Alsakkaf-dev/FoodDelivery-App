'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { BottomSheet, Chip, SelectChip, RatingRow, PrimaryButton, TextAction } from '@/components/ui';
import { translate, type Dictionary } from '@/lib/i18n/dictionaries';
import {
  EMPTY_FILTERS,
  OFFER_IDS,
  DELIVER_TIMES,
  PRICE_TIERS,
  PRICE_SYMBOL,
  type Filters,
} from './search/filters';

// "Filter your search" bottom-sheet (reused by Search + Category listing). Builds
// all four reference dimensions from the shared toggle primitives — no fork:
//   OFFERS         multi-select Chips      (collected-only — no per-item data)
//   DELIVER TIME   single-select Chips     (collected-only)
//   PRICING        single-select SelectChip (WIRED → real price terciles)
//   RATING         interactive RatingRow    (collected-only)
// Edits a local draft; FILTER applies it to the parent list and closes; RESET
// clears. The draft re-syncs to the applied value each time the sheet opens.
function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-label text-muted">{label}</p>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
}

export function FilterSheet({
  open,
  onClose,
  value,
  onApply,
  t,
}: {
  open: boolean;
  onClose: () => void;
  value: Filters;
  onApply: (f: Filters) => void;
  t: Dictionary;
}) {
  const [draft, setDraft] = useState<Filters>(value);
  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const toggleOffer = (id: string) =>
    setDraft((d) => ({
      ...d,
      offers: d.offers.includes(id) ? d.offers.filter((x) => x !== id) : [...d.offers, id],
    }));

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={t.filter_title}
      footer={
        <PrimaryButton
          className="w-full"
          onClick={() => {
            onApply(draft);
            onClose();
          }}
        >
          {t.filter_cta}
        </PrimaryButton>
      }
    >
      <div className="space-y-7 pb-2">
        <Group label={t.offers}>
          {OFFER_IDS.map((id) => (
            <Chip key={id} selected={draft.offers.includes(id)} onToggle={() => toggleOffer(id)}>
              {t[id] as string}
            </Chip>
          ))}
        </Group>

        <Group label={t.deliver_time}>
          {DELIVER_TIMES.map((opt) => (
            <Chip
              key={opt}
              selected={draft.deliverTime === opt}
              onToggle={() =>
                setDraft((d) => ({ ...d, deliverTime: d.deliverTime === opt ? null : opt }))
              }
            >
              {translate(t, 'meta_minutes', { n: opt })}
            </Chip>
          ))}
        </Group>

        <Group label={t.pricing}>
          {PRICE_TIERS.map((tier) => (
            <SelectChip
              key={tier}
              selected={draft.pricing === tier}
              onToggle={() =>
                setDraft((d) => ({ ...d, pricing: d.pricing === tier ? null : tier }))
              }
              aria-label={PRICE_SYMBOL[tier]}
            >
              {PRICE_SYMBOL[tier]}
            </SelectChip>
          ))}
        </Group>

        <Group label={t.rating}>
          <RatingRow value={draft.rating} onChange={(r) => setDraft((d) => ({ ...d, rating: r }))} />
        </Group>

        <div className="flex justify-center">
          <TextAction onClick={() => setDraft(EMPTY_FILTERS)}>{t.reset}</TextAction>
        </div>
      </div>
    </BottomSheet>
  );
}
