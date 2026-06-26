// The canonical auth/form shell: dark-navy hero header + an overlapping white sheet
// that slides up over it (negative top margin → rounded-t-2xl + shadow-sheet). Shared
// by Log In, Sign Up, Forgot Password and the Verification step. Server component.
import type { ReactNode } from 'react';
import type { Locale } from '@/lib/i18n/config';
import { AuthHeader } from './auth-header';

export function AuthShell({
  title,
  subtitle,
  locale,
  showBack = false,
  backLabel,
  children,
}: {
  title: string;
  subtitle?: string;
  locale: Locale;
  showBack?: boolean;
  backLabel?: string;
  children: ReactNode;
}) {
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col bg-ink-header">
      <AuthHeader
        title={title}
        subtitle={subtitle}
        locale={locale}
        showBack={showBack}
        backLabel={backLabel}
      />
      {/* Overlapping white sheet — pulled up over the navy header */}
      <section className="-mt-6 flex-1 rounded-t-2xl bg-surface px-6 pb-10 pt-8 shadow-sheet">
        {children}
      </section>
    </main>
  );
}
