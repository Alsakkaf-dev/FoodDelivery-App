import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import { DEFAULT_LOCALE, dir, isLocale, type Locale } from '@/lib/i18n/config';
import { RegisterSW } from '@/components/pwa/register-sw';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { PushOptIn } from '@/components/pwa/push-optin';

export const metadata: Metadata = {
  title: 'Fahman Orders',
  description: 'Real-time shawarma ordering & home delivery — Johor, Malaysia.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Fahman Orders', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  themeColor: '#C0451F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieLocale = cookies().get('NEXT_LOCALE')?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  return (
    <html lang={locale} dir={dir(locale)}>
      <body>
        {children}
        <RegisterSW />
        <InstallPrompt lang={locale} />
        <PushOptIn lang={locale} />
      </body>
    </html>
  );
}
