import { getI18n } from '@/lib/i18n/server';
import { AuthShell } from '@/components/auth/auth-shell';
import { ForgotForm } from '@/components/auth/forgot-form';

// Forgot Password — preview-only UI on the shared auth shell (no reset backend; recovery is
// via code-based sign-in on /login). Back button returns to the previous screen.
export default function ForgotPasswordPage() {
  const { locale, t } = getI18n();
  return (
    <AuthShell title={t.forgot_password} subtitle={t.tagline} showBack backLabel={t.back} locale={locale}>
      <ForgotForm locale={locale} />
    </AuthShell>
  );
}
