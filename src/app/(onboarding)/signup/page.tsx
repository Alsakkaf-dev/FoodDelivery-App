import { getI18n } from '@/lib/i18n/server';
import { AuthShell } from '@/components/auth/auth-shell';
import { SignupForm } from '@/components/auth/signup-form';

// Sign Up — preview-only UI on the shared auth shell (no password/sign-up backend; the
// real path is code-based sign-in on /login). Back button returns to the previous screen.
export default function SignupPage() {
  const { locale, t } = getI18n();
  return (
    <AuthShell title={t.sign_up} subtitle={t.tagline} showBack backLabel={t.back} locale={locale}>
      <SignupForm locale={locale} />
    </AuthShell>
  );
}
