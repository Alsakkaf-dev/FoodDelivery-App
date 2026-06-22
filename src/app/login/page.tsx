'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDictionary } from '@/lib/i18n/dictionaries';

type Method = 'phone' | 'email';

// The login screen shows both languages at once, so it sources the PDPA consent
// copy from both dictionaries rather than a single active locale.
const tEn = getDictionary('en');
const tAr = getDictionary('ar');

// SCR-C-08 / UC-C-01 — login for all roles. Two free channels: phone OTP (delivered
// over WhatsApp via the Supabase Send-SMS hook in prod) and email OTP (built-in).
export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [method, setMethod] = useState<Method>('phone');
  const [step, setStep] = useState<'input' | 'code'>('input');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [consent, setConsent] = useState(false); // PDPA: opt-in, default off (US-007)
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
    if (!j.ok) return setError(j.error?.message ?? 'Could not send the code.');
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
    if (!j.ok) return setError(j.error?.message ?? 'Invalid code.');
    const role = j.data?.role ?? 'customer';
    const next = params.get('next') || (role === 'operator' ? '/operator' : role === 'rider' ? '/rider' : '/');
    router.push(next);
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-5 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-rust">Fahman Orders</h1>
        <p className="text-muted">Sign in — فهمان أوردرز</p>
      </div>

      {step === 'input' ? (
        <div className="card space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={`${method === 'phone' ? 'btn-primary' : 'btn-secondary'} text-sm`}
              onClick={() => { setMethod('phone'); setError(''); }}
            >
              WhatsApp · هاتف
            </button>
            <button
              type="button"
              className={`${method === 'email' ? 'btn-primary' : 'btn-secondary'} text-sm`}
              onClick={() => { setMethod('email'); setError(''); }}
            >
              Email · بريد
            </button>
          </div>

          {method === 'phone' ? (
            <>
              <label className="block text-sm font-semibold">Phone number / رقم الهاتف</label>
              <input
                className="field" inputMode="tel" placeholder="+60 12-345 6789"
                value={phone} onChange={(e) => setPhone(e.target.value)}
              />
            </>
          ) : (
            <>
              <label className="block text-sm font-semibold">Email / البريد الإلكتروني</label>
              <input
                className="field" inputMode="email" type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </>
          )}

          <label className="flex items-start gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1"
              aria-label={tEn.consent_agree}
            />
            <span>
              {tEn.consent_agree} / {tAr.consent_agree}
            </span>
          </label>
          <button className="btn-primary w-full" disabled={busy || missing || !consent} onClick={requestCode}>
            {busy ? 'Sending…' : 'Send code / إرسال الرمز'}
          </button>
        </div>
      ) : (
        <div className="card space-y-4">
          <label className="block text-sm font-semibold">Enter the 6-digit code / أدخل الرمز</label>
          <input
            className="field text-center text-2xl tracking-[0.5em]" inputMode="numeric" maxLength={6}
            value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          />
          <button className="btn-primary w-full" disabled={busy || code.length !== 6} onClick={verify}>
            {busy ? 'Verifying…' : 'Verify / تأكيد'}
          </button>
          <button className="btn-secondary w-full" onClick={() => { setStep('input'); setCode(''); }}>
            {method === 'phone' ? 'Change number' : 'Change email'}
          </button>
        </div>
      )}

      {error ? <p className="rounded-control bg-rust/10 p-3 text-center text-sm text-rust" role="alert">{error}</p> : null}
    </main>
  );
}
