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
      <OtpInput
        length={6}
        value={code}
        onChange={onChange}
        label={t.code_label}
        onResend={onResend}
        resendSeconds={30}
        resendLabel={t.resend}
        resendInLabel={t.resend_in}
      />
      <PrimaryButton onClick={onVerify} disabled={busy || code.length !== 6}>
        {busy ? t.loading : t.verify}
      </PrimaryButton>
      <TextAction tone="brand" onClick={onChangeContact} className="mx-auto block">
        {t.back}
      </TextAction>
    </div>
  );
}
