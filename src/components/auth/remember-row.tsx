'use client';
// "Remember me" + "Forgot Password" row on the Log In sheet. Remember-me is local-only
// (presentational — no session backend) and never gates submit. Forgot links to the
// preview Forgot Password route. Composes #02's Checkbox + TextAction.
import Link from 'next/link';
import { Checkbox, TextAction } from '@/components/ui';

export function RememberRow({
  checked,
  onChange,
  rememberLabel,
  forgotLabel,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  rememberLabel: string;
  forgotLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="flex items-center gap-2 text-caption text-body">
        <Checkbox checked={checked} onChange={onChange} aria-label={rememberLabel} />
        <span>{rememberLabel}</span>
      </label>
      <TextAction as={Link} href="/forgot-password" tone="brand">
        {forgotLabel}
      </TextAction>
    </div>
  );
}
