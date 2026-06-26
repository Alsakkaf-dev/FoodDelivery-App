'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PrimaryButton, BottomSheet, EmptyState, TextAction } from '@/components/ui';
import type { Address, Zone } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { AddressCard, addressKind } from './address-card';
import { AccountAddressForm } from './account-address-form';

// My Address — the saved-address book. Reads are real (listAddresses, passed in
// as `initial`); the only real WRITE in this lane is "Add new address" (its own
// route → createAddress). Edit opens the address form in a BottomSheet and Delete
// removes optimistically with an Undo affordance — both are preview-only because
// there is no updateAddress/deleteAddress server action yet (see TEAM_STATUS.md).
export function AddressList({
  t,
  zones,
  initial,
}: {
  t: Dictionary;
  zones: Zone[];
  initial: Address[];
}) {
  const router = useRouter();
  const [list, setList] = useState<Address[]>(initial);
  const [editing, setEditing] = useState<Address | null>(null);
  const [removed, setRemoved] = useState<{ addr: Address; index: number } | null>(null);

  function onDelete(addr: Address) {
    const index = list.findIndex((a) => a.id === addr.id);
    setList((prev) => prev.filter((a) => a.id !== addr.id));
    setRemoved({ addr, index });
  }

  function undoDelete() {
    if (!removed) return;
    setList((prev) => {
      const next = [...prev];
      next.splice(Math.min(removed.index, next.length), 0, removed.addr);
      return next;
    });
    setRemoved(null);
  }

  function onEdited(updated: Address) {
    setList((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setEditing(null);
  }

  return (
    <div className="space-y-4">
      {removed ? (
        <div role="status" className="flex items-center justify-between gap-3 rounded-xl bg-surface-alt px-4 py-3">
          <span className="text-body text-ink">{t.address_deleted}</span>
          <TextAction tone="brand" onClick={undoDelete}>
            {t.reset}
          </TextAction>
        </div>
      ) : null}

      {list.length === 0 ? (
        <EmptyState icon="map-pin" title={t.no_addresses} hint={t.no_addresses_hint} />
      ) : (
        <ul className="space-y-3">
          {list.map((a) => (
            <li key={a.id}>
              <AddressCard
                kind={addressKind(a.label)}
                label={a.label ?? t.label_other}
                line1={a.line1}
                editLabel={t.edit}
                deleteLabel={t.delete_address}
                onEdit={() => setEditing(a)}
                onDelete={() => onDelete(a)}
              />
            </li>
          ))}
        </ul>
      )}

      <PrimaryButton fullWidth onClick={() => router.push('/account/addresses/new')}>
        {t.add_new_address}
      </PrimaryButton>

      <BottomSheet open={Boolean(editing)} onClose={() => setEditing(null)} title={t.edit} closeLabel={t.back}>
        {editing ? <AccountAddressForm t={t} zones={zones} initial={editing} onDone={onEdited} /> : null}
      </BottomSheet>
    </div>
  );
}
