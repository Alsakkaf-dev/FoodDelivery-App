'use client';
// Set a new password for the recovery session opened by the email reset link (the
// confirm route lands that session before redirecting here). On success → /login.
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import { FilledInput, PrimaryButton } from '@/components/ui';
import { ErrorNote } from './auth-bits';
import { updatePassword } from '@/lib/auth/password';

export function ResetPasswordForm({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setError(t.password_too_short);
    if (password !== confirm) return setError(t.password_mismatch);
    setError('');
    startTransition(async () => {
      const res = await updatePassword({ password });
      if (res.ok) {
        router.push('/login?reset=1');
        router.refresh();
      } else {
        setError(t.error_generic);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <FilledInput label={t.new_password} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
      <FilledInput label={t.retype_password} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
      <PrimaryButton type="submit" fullWidth disabled={!password || !confirm} loading={pending}>
        {t.update_password}
      </PrimaryButton>
      {error ? <ErrorNote>{error}</ErrorNote> : null}
    </form>
  );
}
