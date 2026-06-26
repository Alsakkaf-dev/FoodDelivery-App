'use client';
// Forgot Password — sends a real Supabase recovery link to the email. The response
// is always "sent" (we never reveal whether an account exists). The link lands on
// /api/auth/confirm?type=recovery → /reset-password to set a new password.
import { useState, useTransition } from 'react';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import { FilledInput, PrimaryButton } from '@/components/ui';
import { PreviewNote, ErrorNote } from './auth-bits';
import { requestPasswordReset } from '@/lib/auth/password';

export function ForgotForm({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const res = await requestPasswordReset({ email });
      if (res.ok) setSent(true);
      else setError(t.error_generic);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <FilledInput
        label={t.email}
        type="email"
        inputMode="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      <PrimaryButton type="submit" fullWidth disabled={!email} loading={pending}>
        {t.reset_password}
      </PrimaryButton>
      {sent ? <PreviewNote>{t.reset_link_sent}</PreviewNote> : null}
      {error ? <ErrorNote>{error}</ErrorNote> : null}
    </form>
  );
}
