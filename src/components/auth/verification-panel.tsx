'use client';
// The reference "Verification" screen, mapped onto the REAL OTP flow's code step.
// Uses #02's OtpInput (one bound string, SIX cells per the backend's code.length(6)
// schema — NOT the mock's 4 — with a built-in Resend timer). Verify + change-contact
// are wired to the parent's preserved request/verify handlers.
import { OtpInput, PrimaryButton, TextAction } from '@/components/ui';
import type { Dictionary } from '@/lib/i18n/dictionaries';

export function VerificationPanel({
  code,
  onChange,
  onVerify,
  onResend,
  onChangeContact,
  busy,
  t,
}: {
  code: string;
  onChange: (value: string) => void;
  onVerify: () => void;
  onResend: () => void;
  onChangeContact: () => void;
  busy: boolean;
  t: Dictionary;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-center text-label font-semibold uppercase tracking-wide text-muted">{t.code_label}</p>
        <OtpInput
          length={6}
          value={code}
          onChange={onChange}
          onResend={onResend}
          resendSeconds={30}
          resendLabel={t.resend}
          formatResendIn={(s) => t.resend_in.replace('{{s}}', String(s))}
        />
      </div>
      <PrimaryButton onClick={onVerify} disabled={busy || code.length !== 6}>
        {busy ? t.loading : t.verify}
      </PrimaryButton>
      <TextAction tone="brand" onClick={onChangeContact} className="mx-auto block">
        {t.back}
      </TextAction>
    </div>
  );
}
