import { getI18n } from '@/lib/i18n/server';
import { OfflineBanner } from '@/components/ui/states';
import { BottomNav } from '@/components/ui/nav';
import { LangSwitch } from '@/components/ui/lang-switch';
import { riderNav } from '@/lib/nav/items';

// Rider route-group shell (created by Plan 04 per ruling R-5). It provides the shared
// chrome — offline banner, the standard max-w-md `main` frame, the public LangSwitch,
// and the rider bottom nav — so `(rider)/rider/page.tsx` (owned by Plan 17) renders the
// delivery-feed body only (no nav slot, no banner, no frame of its own). Locale + `dir`
// are inherited from the root layout. No auth gate here — `middleware.ts` guards the
// /rider routes; this shell is presentational chrome only. `pb-28` clears the floating nav.
export default function RiderLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = getI18n();
  return (
    <>
      <OfflineBanner label={t.offline} />
      <main className="mx-auto min-h-dvh max-w-md space-y-4 p-4 pb-28">
        <div className="flex justify-end">
          <LangSwitch current={locale} />
        </div>
        {children}
      </main>
      <BottomNav items={riderNav(t)} />
    </>
  );
}
