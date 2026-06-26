'use client';
// PDPA consent — FROZEN behaviour preserved from the legacy login: the checkbox copy
// is shown in BOTH languages at once (sourced from both dictionaries, not the active
// locale), since the sign-in screen is shared by every role before a locale is chosen.
// Only the styling changes (now uses #02's Checkbox primitive).
import { getDictionary } from '@/lib/i18n/dictionaries';
import { Checkbox } from '@/components/ui';

const tEn = getDictionary('en');
const tAr = getDictionary('ar');

export function ConsentRow({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 text-caption text-body">
      <Checkbox checked={checked} onChange={onChange} aria-label={tEn.consent_agree} className="mt-0.5" />
      <span>
        {tEn.consent_agree} / {tAr.consent_agree}
      </span>
    </label>
  );
}
