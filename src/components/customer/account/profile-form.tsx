'use client';
import { useState, useTransition } from 'react';
import { Avatar, FilledInput, PrimaryButton, IconButton } from '@/components/ui';
import { updateProfile } from '@/lib/domain/profile';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// Edit Profile — centered avatar with an orange edit-FAB (overlaid, RTL-anchored
// to the logical end/bottom) + filled inputs (name/email/phone/bio) + a SAVE CTA.
// SAVE calls the real `updateProfile` server action (RLS-scoped to the caller's
// own row). Phone is read-only here — it is changed via the OTP re-verify flow.
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
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  function dirty<T>(setter: (v: T) => void) {
    return (v: T) => {
      setSaved(false);
      setError('');
      setter(v);
    };
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateProfile({ name, email: email || undefined, bio });
      if (res.ok) setSaved(true);
      else setError(t.error_generic);
    });
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
          {t.done}
        </p>
      ) : error ? (
        <p role="alert" className="text-body font-medium text-danger">
          {error}
        </p>
      ) : null}

      <PrimaryButton type="submit" fullWidth loading={pending}>
        {t.save}
      </PrimaryButton>
    </form>
  );
}
