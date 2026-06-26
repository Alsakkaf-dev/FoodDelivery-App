'use client';
// Sign Up — real email+password account creation (Supabase auth). Captures the
// display name (stored in user_metadata and copied to the profile). If the project
// requires email confirmation, we show "check your email"; otherwise the session is
// live and we route by role. Google sign-up is offered via the SocialRow.
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import { FilledInput, PrimaryButton, TextAction } from '@/components/ui';
import { SocialRow } from './social-row';
import { Divider, ErrorNote, PreviewNote } from './auth-bits';
import { signUpWithPassword } from '@/lib/auth/password';

const dest = (r: string) => (r === 'operator' ? '/operator' : r === 'rider' ? '/rider' : '/');

export function SignupForm({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  const incomplete = !name || !email || password.length < 8 || password !== confirm;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setError(t.password_too_short);
    if (password !== confirm) return setError(t.password_mismatch);
    setError('');
    startTransition(async () => {
      const res = await signUpWithPassword({ name, email, password });
      if (!res.ok) return setError(res.error.code === 'conflict' ? t.email_taken : t.error_generic);
      if (res.data.needsConfirmation) {
        setSent(true);
      } else {
        router.push(dest(res.data.role));
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FilledInput label={t.full_name} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      <FilledInput label={t.email} type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      <FilledInput label={t.password} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
      <FilledInput label={t.retype_password} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />

      <PrimaryButton type="submit" fullWidth disabled={incomplete} loading={pending}>
        {t.create_account}
      </PrimaryButton>

      {sent ? <PreviewNote>{t.check_your_email}</PreviewNote> : null}
      {error ? <ErrorNote>{error}</ErrorNote> : null}

      <Divider label={t.or} />
      <SocialRow comingSoonLabel={t.social_coming_soon} locale={locale} />

      <p className="text-center text-caption text-body">
        {t.have_account}{' '}
        <TextAction href="/login" tone="brand">{t.login}</TextAction>
      </p>
    </form>
  );
}
