'use client';
import { useState } from 'react';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { BottomSheet, FilledInput, PrimaryButton } from '@/components/ui';

// SCR-C-05 — "Add Card" (front-end only). The order API is frozen to cod|duitnow_qr,
// so this NEVER places a card order and NEVER persists a full PAN: it captures a card
// for display only and returns `{brand,last4}` to the payment screen's local vault.
export type SavedCard = { brand: string; last4: string };

export function AddCard({
  lang,
  open,
  onClose,
  onSaved,
}: {
  lang: 'en' | 'ar';
  open: boolean;
  onClose: () => void;
  onSaved: (card: SavedCard) => void;
}) {
  const t = getDictionary(lang);
  const [holder, setHolder] = useState('');
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const digits = number.replace(/\D/g, '');
  const valid =
    holder.trim().length > 1 &&
    digits.length >= 12 &&
    /^\d{2}\/\d{2,4}$/.test(expiry) &&
    cvc.length >= 3;

  function onNumber(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 16);
    setNumber(d.replace(/(.{4})(?=.)/g, '$1 '));
  }
  function onExpiry(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 6);
    setExpiry(d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`);
  }

  function submit() {
    if (!valid) return;
    // Display-only: keep ONLY the last 4 digits — never the full PAN or the CVC.
    onSaved({ brand: 'card', last4: digits.slice(-4) });
    setHolder('');
    setNumber('');
    setExpiry('');
    setCvc('');
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={t.add_new}
      closeLabel={t.dismiss}
      footer={
        <PrimaryButton fullWidth onClick={submit} disabled={!valid}>
          {t.add_and_pay}
        </PrimaryButton>
      }
    >
      <div className="space-y-4">
        <FilledInput
          label={t.card_holder_name}
          value={holder}
          onChange={(e) => setHolder(e.target.value)}
          autoComplete="cc-name"
        />
        <FilledInput
          label={t.card_number}
          value={number}
          onChange={(e) => onNumber(e.target.value)}
          inputMode="numeric"
          dir="ltr"
          placeholder="2134 5678 9012 3456"
          autoComplete="cc-number"
        />
        <div className="flex gap-3">
          <FilledInput
            containerClassName="flex-1"
            label={t.expire_date}
            value={expiry}
            onChange={(e) => onExpiry(e.target.value)}
            inputMode="numeric"
            dir="ltr"
            placeholder="mm/yyyy"
            autoComplete="cc-exp"
          />
          <FilledInput
            containerClassName="flex-1"
            label={t.cvc}
            type="password"
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
            inputMode="numeric"
            dir="ltr"
            placeholder="•••"
            autoComplete="cc-csc"
          />
        </div>
      </div>
    </BottomSheet>
  );
}
