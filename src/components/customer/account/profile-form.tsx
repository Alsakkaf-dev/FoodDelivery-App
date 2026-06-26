'use client';
import { useState } from 'react';
import { Avatar, FilledInput, PrimaryButton, IconButton } from '@/components/ui';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// Edit Profile — centered avatar with an orange edit-FAB (overlaid, RTL-anchored
// to the logical end/bottom) + filled inputs (name/email/phone/bio) + a SAVE CTA.
//
// There is NO updateProfile server action and no email/bio/avatar column (frozen
// domain — consolidated backend request filed in TEAM_STATUS.md). So SAVE is an
// honest client-side optimistic stub: it confirms inline ("saved_demo") without
// claiming a real write. Phone is read-only (it's the account identity key).
// When the backend lands, wire `onSave` to the real action; the UI is unchanged.
export function ProfileForm({
  t,
  initial,
}: {
  t: Dictionary;
  initial: { name: string; email: string; phone: string; bio: string };
}) {
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [bio, setBio] = useState(initial.bio);
  const [saved, setSaved] = useState(false);

  function dirty<T>(setter: (v: T) => void) {
    return (v: T) => {
      setSaved(false);
      setter(v);
    };
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Optimistic, preview-only: no server write exists yet.
    setSaved(true);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="flex justify-center">
        <div className="relative inline-block">
          <Avatar name={name} size="xl" backdrop />
          <IconButton
            type="button"
            variant="add"
            icon="edit"
            aria-label={t.edit_profile}
            className="absolute bottom-0 end-0"
          />
        </div>
      </div>

      <FilledInput label={t.full_name} value={name} onChange={(e) => dirty(setName)(e.target.value)} autoComplete="name" />
      <FilledInput label={t.email} type="email" value={email} onChange={(e) => dirty(setEmail)(e.target.value)} autoComplete="email" />
      <FilledInput label={t.phone} value={initial.phone} readOnly dir="ltr" />
      <FilledInput label={t.bio} multiline rows={3} value={bio} onChange={(e) => dirty(setBio)(e.target.value)} />

      {saved ? (
        <p role="status" className="text-body font-medium text-success">
          {t.saved_demo}
        </p>
      ) : null}

      <PrimaryButton type="submit" fullWidth>
        {t.save}
      </PrimaryButton>
    </form>
  );
}
