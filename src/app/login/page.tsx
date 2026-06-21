'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// SCR-C-08 / UC-C-01 — phone-OTP login for all roles. Redirects by role on success.
export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [consent, setConsent] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function requestCode() {
    setBusy(true); setError('');
    const res = await fetch('/api/auth/otp/request', { method: 'POST', body: JSON.stringify({ phone: phone.replace(/[\s-]/g, '') }) });
    const j = await res.json();
    setBusy(false);
    if (!j.ok) return setError(j.error?.message ?? 'Could not send the code.');
    setStep('code');
  }

  async function verify() {
    setBusy(true); setError('');
    const res = await fetch('/api/auth/otp/verify', { method: 'POST', body: JSON.stringify({ phone: phone.replace(/[\s-]/g, ''), code }) });
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
        <p className="text-muted">Sign in with your phone — فهمان أوردرز</p>
      </div>

      {step === 'phone' ? (
        <div className="card space-y-4">
          <label className="block text-sm font-semibold">Phone number / رقم الهاتف</label>
          <input
            className="field" inputMode="tel" placeholder="+60 12-345 6789"
            value={phone} onChange={(e) => setPhone(e.target.value)}
          />
          <label className="flex items-start gap-2 text-sm text-muted">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
            I agree to receive order updates and accept the privacy notice (PDPA). / أوافق على استلام تحديثات الطلب وسياسة الخصوصية.
          </label>
          <button className="btn-primary w-full" disabled={busy || !phone || !consent} onClick={requestCode}>
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
          <button className="btn-secondary w-full" onClick={() => setStep('phone')}>Change number</button>
        </div>
      )}

      {error ? <p className="rounded-control bg-rust/10 p-3 text-center text-sm text-rust" role="alert">{error}</p> : null}
    </main>
  );
}
