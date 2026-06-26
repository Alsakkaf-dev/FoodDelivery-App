'use client';
// Sign Up — PREVIEW-ONLY. There is no password/sign-up backend and AUTH_DISABLED is on,
// so this faithfully reproduces the reference UI but NEVER calls a route or creates a
// session. Local validation only, with an honest "preview only" note pointing users to
// the real code-based sign-in on /login.
import { useState } from 'react';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import { FilledInput, PrimaryButton, TextAction } from '@/components/ui';
import { SocialRow } from './social-row';
import { Divider, PreviewNote } from './auth-bits';

export function SignupForm({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [notice, setNotice] = useState(false);

  const incomplete = !name || !email || !password || password !== confirm;

  return (
    <div className="space-y-5">
      <FilledInput label={t.full_name} placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
      <FilledInput
        label={t.email}
        type="email"
        inputMode="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <FilledInput label={t.password} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <FilledInput label={t.retype_password} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />

      <PrimaryButton onClick={() => setNotice(true)} disabled={incomplete}>
        {t.sign_up}
      </PrimaryButton>
      {notice ? <PreviewNote>{t.preview_only_note}</PreviewNote> : null}

      <Divider label={t.or} />
      <SocialRow comingSoonLabel={t.social_coming_soon} />

      <p className="text-center text-caption text-body">
        {t.have_account}{' '}
        <TextAction href="/login" tone="brand">
          {t.login}
        </TextAction>
      </p>
    </div>
  );
}
