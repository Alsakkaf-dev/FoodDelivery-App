import { getI18n } from '@/lib/i18n/server';
import { AuthShell } from '@/components/auth/auth-shell';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

// Reset Password — the recovery email link finalizes a session at /api/auth/confirm,
// which redirects here to set a new password. On success the user returns to /login.
export const dynamic = 'force-dynamic';

export default function ResetPasswordPage() {
  const { locale, t } = getI18n();
  return (
    <AuthShell title={t.reset_password} subtitle={t.tagline} locale={locale}>
      <ResetPasswordForm locale={locale} />
    </AuthShell>
  );
}
