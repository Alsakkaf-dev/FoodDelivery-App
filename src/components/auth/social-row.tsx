'use client';
// Continue-with-Google (Supabase OAuth). The browser kicks off the OAuth redirect;
// the session is finalized server-side at /api/auth/callback, which provisions the
// profile and routes by role. `next` is threaded through so post-login lands right.
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import { Icon } from '@/components/icons';

export function SocialRow({ locale }: { locale?: Locale; comingSoonLabel?: string }) {
  const params = useSearchParams();
  const label = locale ? getDictionary(locale).continue_with_google : 'Continue with Google';

  async function google() {
    const sb = createClient();
    const next = params.get('next') ?? '/';
    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}` },
    });
  }

  return (
    <button
      type="button"
      onClick={google}
      className="flex min-h-tap w-full items-center justify-center gap-2 rounded-lg border border-line bg-surface text-button font-bold text-ink transition hover:bg-surface-alt active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
    >
      <Icon name="google" className="h-5 w-5" aria-hidden />
      {label}
    </button>
  );
}
