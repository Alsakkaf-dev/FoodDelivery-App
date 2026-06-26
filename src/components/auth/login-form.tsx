'use client';
// Login for all roles, four ways: phone OTP (WhatsApp), email OTP, email+password,
// and Google. Phone/email-OTP create the account on first verify (PDPA consent
// gate). Email+password is for returning users (no consent gate). Role→route
// redirect, ?next, and the bilingual PDPA are preserved.
import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import { Chip, FilledInput, PrimaryButton, TextAction } from '@/components/ui';
import { ConsentRow } from './consent-row';
import { RememberRow } from './remember-row';
import { SocialRow } from './social-row';
import { VerificationPanel } from './verification-panel';
import { Divider, ErrorNote, PreviewNote } from './auth-bits';
import { signInWithPassword } from '@/lib/auth/password';

type Method = 'phone' | 'email';
const dest = (r: string) => (r === 'operator' ? '/operator' : r === 'rider' ? '/rider' : '/');

export function LoginForm({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const router = useRouter();
  const params = useSearchParams();
  const [method, setMethod] = useState<Method>('phone');
  const [emailMode, setEmailMode] = useState<'password' | 'code'>('password');
  const [step, setStep] = useState<'input' | 'code'>('input');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [consent, setConsent] = useState(false); // PDPA: opt-in, default off (US-007)
  const [remember, setRemember] = useState(false); // presentational only
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();

  const cleanPhone = phone.replace(/[\s-]/g, '');
  const missing = method === 'phone' ? !cleanPhone : !email;
  const justReset = params.get('reset') === '1';

  function go(role: string) {
    router.push(params.get('next') || dest(role));
    router.refresh();
  }

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
    go(j.data?.role ?? 'customer');
  }

  function passwordSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const res = await signInWithPassword({ email, password });
      if (!res.ok) return setError(t.invalid_credentials);
      go(res.data.role);
    });
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
      {justReset ? <PreviewNote>{t.password_updated}</PreviewNote> : null}

      {/* Channel toggle (phone ↔ email) */}
      <div className="grid grid-cols-2 gap-2" role="tablist" aria-label={t.login}>
        <Chip selected={method === 'phone'} onToggle={() => { setMethod('phone'); setError(''); }}>
          {t.phone}
        </Chip>
        <Chip selected={method === 'email'} onToggle={() => { setMethod('email'); setError(''); }}>
          {t.email}
        </Chip>
      </div>

      {method === 'email' && emailMode === 'password' ? (
        <form onSubmit={passwordSignIn} className="space-y-6">
          <FilledInput label={t.email} type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <FilledInput label={t.password} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          <PrimaryButton type="submit" fullWidth disabled={!email || !password} loading={pending}>
            {t.login}
          </PrimaryButton>
          {error ? <ErrorNote>{error}</ErrorNote> : null}
          <div className="flex items-center justify-between">
            <TextAction tone="brand" onClick={() => { setEmailMode('code'); setError(''); }}>{t.use_code}</TextAction>
            <TextAction tone="brand" href="/forgot-password">{t.forgot_password}</TextAction>
          </div>
        </form>
      ) : (
        <>
          {method === 'phone' ? (
            <FilledInput label={t.phone} inputMode="tel" placeholder="+60 12-345 6789" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
          ) : (
            <FilledInput label={t.email} type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          )}

          <ConsentRow checked={consent} onChange={setConsent} />

          <PrimaryButton onClick={requestCode} disabled={busy || missing || !consent}>
            {busy ? t.loading : t.send_code}
          </PrimaryButton>

          {method === 'email' ? (
            <div className="text-center">
              <TextAction tone="brand" onClick={() => { setEmailMode('password'); setError(''); }}>{t.use_password}</TextAction>
            </div>
          ) : null}

          <RememberRow checked={remember} onChange={setRemember} rememberLabel={t.remember_me} forgotLabel={t.forgot_password} />

          {error ? <ErrorNote>{error}</ErrorNote> : null}
        </>
      )}

      <Divider label={t.or} />
      <SocialRow comingSoonLabel={t.social_coming_soon} locale={locale} />

      <p className="text-center text-caption text-body">
        {t.no_account}{' '}
        <TextAction href="/signup" tone="brand">{t.sign_up}</TextAction>
      </p>
    </div>
  );
}
