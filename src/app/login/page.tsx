import { Suspense } from 'react';
import { getI18n } from '@/lib/i18n/server';
import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/login-form';

// SCR-C-08 / UC-C-01 — login for all roles, restyled into the shared dark-header /
// white-sheet auth shell. The REAL OTP flow + API contract ({ok,error.message,data.role})
// + role→route redirect + ?next + bilingual PDPA consent live in <LoginForm> (client) and
// are preserved verbatim. AUTH_DISABLED is untouched (no guards added). useSearchParams()
// inside LoginForm is wrapped in <Suspense> so static rendering doesn't bail.
export default function LoginPage() {
  const { locale, t } = getI18n();
  return (
    <AuthShell title={t.login} subtitle={t.tagline} locale={locale}>
      <Suspense>
        <LoginForm locale={locale} />
      </Suspense>
    </AuthShell>
  );
}
