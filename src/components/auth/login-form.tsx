'use client';
// SCR-C-08 / UC-C-01 — login for all roles. Two free channels: phone OTP (WhatsApp via
// the Supabase Send-SMS hook in prod) and email OTP (built-in). This is the REAL flow
// lifted from the old login/page.tsx — the API contract, role→route redirect, ?next and
// bilingual PDPA are PRESERVED verbatim; only the presentation moves into the new shell.
// AUTH_DISABLED stays untouched (no guards added here).
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import { Chip, FilledInput, PrimaryButton, TextAction } from '@/components/ui';
import { ConsentRow } from './consent-row';
import { RememberRow } from './remember-row';
import { SocialRow } from './social-row';
import { VerificationPanel } from './verification-panel';
import { Divider, ErrorNote } from './auth-bits';

type Method = 'phone' | 'email';

export function LoginForm({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const router = useRouter();
  const params = useSearchParams();
  const [method, setMethod] = useState<Method>('phone');
  const [step, setStep] = useState<'input' | 'code'>('input');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [consent, setConsent] = useState(false); // PDPA: opt-in, default off (US-007)
  const [remember, setRemember] = useState(false); // presentational only
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const cleanPhone = phone.replace(/[\s-]/g, '');
  const missing = method === 'phone' ? !cleanPhone : !email;

  async function requestCode() {
    setBusy(true);
    setError('');
    const url = method === 'phone' ? '/api/auth/otp/request' : '/api/auth/email/request';
    const payload = method === 'phone' ? { phone: cleanPhone } : { email };
    const res = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
    const j = await res.json();
    setBusy(false);
    if (!j.ok) return setError(j.error?.message ?? t.error_generic);
    setStep('code');
  }

  async function verify() {
    setBusy(true);
    setError('');
    const url = method === 'phone' ? '/api/auth/otp/verify' : '/api/auth/email/verify';
    const payload = method === 'phone' ? { phone: cleanPhone, code } : { email, code };
    const res = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
    const j = await res.json();
    setBusy(false);
    if (!j.ok) return setError(j.error?.message ?? t.error_generic);
    const role = j.data?.role ?? 'customer';
    const next = params.get('next') || (role === 'operator' ? '/operator' : role === 'rider' ? '/rider' : '/');
    router.push(next);
    router.refresh();
  }

  if (step === 'code') {
    return (
      <div className="space-y-6">
        <VerificationPanel
          code={code}
          onChange={(v) => setCode(v.replace(/\D/g, ''))}
          onVerify={verify}
          onResend={requestCode}
          onChangeContact={() => {
            setStep('input');
            setCode('');
            setError('');
          }}
          busy={busy}
          t={t}
        />
        {error ? <ErrorNote>{error}</ErrorNote> : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Channel toggle (phone OTP ↔ email OTP) */}
      <div className="grid grid-cols-2 gap-2" role="tablist" aria-label={t.login}>
        <Chip selected={method === 'phone'} onToggle={() => { setMethod('phone'); setError(''); }}>
          {t.phone}
        </Chip>
        <Chip selected={method === 'email'} onToggle={() => { setMethod('email'); setError(''); }}>
          {t.email}
        </Chip>
      </div>

      {method === 'phone' ? (
        <FilledInput
          label={t.phone}
          inputMode="tel"
          placeholder="+60 12-345 6789"
          value={phone}
          onChange={setPhone}
        />
      ) : (
        <FilledInput
          label={t.email}
          type="email"
          inputMode="email"
          placeholder="you@example.com"
          value={email}
          onChange={setEmail}
        />
      )}

      <ConsentRow checked={consent} onChange={setConsent} />

      <PrimaryButton onClick={requestCode} disabled={busy || missing || !consent}>
        {busy ? t.loading : t.send_code}
      </PrimaryButton>

      <RememberRow
        checked={remember}
        onChange={setRemember}
        rememberLabel={t.remember_me}
        forgotLabel={t.forgot_password}
      />

      {error ? <ErrorNote>{error}</ErrorNote> : null}

      <Divider label={t.or} />
      <SocialRow comingSoonLabel={t.social_coming_soon} />

      <p className="text-center text-caption text-body">
        {t.no_account}{' '}
        <TextAction as={Link} href="/signup" tone="brand">
          {t.sign_up}
        </TextAction>
      </p>
    </div>
  );
}
