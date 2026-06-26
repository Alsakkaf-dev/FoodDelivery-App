'use client';
import { Chip } from '@/components/ui';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// "Recent Keywords" — horizontally scrolling outline pills (shared Chip primitive
// in its unselected/outline state) that re-run a past search on tap, plus a clear
// action. Hidden entirely when there is no history. The `-mx-4 px-4` lets the row
// bleed to the screen gutter and scroll; under dir=rtl the scroll axis mirrors.
export function RecentKeywords({
  items,
  onPick,
  onClear,
  t,
}: {
  items: string[];
  onPick: (kw: string) => void;
  onClear: () => void;
  t: Dictionary;
}) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="recent-h" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 id="recent-h" className="text-h2 font-bold text-ink">
          {t.recent_keywords}
        </h2>
        <button type="button" onClick={onClear} className="min-h-tap text-link text-brand">
          {t.clear}
        </button>
      </div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((kw) => (
          <Chip key={kw} selected={false} onToggle={() => onPick(kw)} className="shrink-0">
            {kw}
          </Chip>
        ))}
      </div>
    </section>
  );
}
