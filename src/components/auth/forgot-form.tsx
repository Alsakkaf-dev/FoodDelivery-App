'use client';
// Forgot Password — PREVIEW-ONLY. No password-reset backend exists (auth is OTP-only +
// AUTH_DISABLED), so this reproduces the reference UI without calling a route. The real
// recovery path is simply signing in again with a code on /login, surfaced via the note.
import { useState } from 'react';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import { FilledInput, PrimaryButton } from '@/components/ui';
import { PreviewNote } from './auth-bits';

export function ForgotForm({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState(false);

  return (
    <div className="space-y-6">
      <FilledInput
        label={t.email}
        type="email"
        inputMode="email"
        placeholder="you@example.com"
        value={email}
        onChange={setEmail}
      />
      <PrimaryButton onClick={() => setNotice(true)} disabled={!email}>
        {t.send_code}
      </PrimaryButton>
      {notice ? <PreviewNote>{t.preview_only_note}</PreviewNote> : null}
    </div>
  );
}
