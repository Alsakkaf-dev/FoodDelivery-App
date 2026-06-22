import { getI18n } from '@/lib/i18n/server';
import { OfflineBanner } from '@/components/ui/states';
import { BottomNav } from '@/components/ui/nav';
import { customerNav } from '@/lib/nav/items';

// Customer route-group shell (mirrors the rider page frame): offline banner on
// top, the standard max-w-md `main` frame, and the customer bottom nav. Locale
// and `dir` are inherited from the root layout (set on <html> from NEXT_LOCALE).
// Customer routes are public — no auth gate here.
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { t } = getI18n();
  return (
    <>
      <OfflineBanner label={t.offline} />
      <main className="mx-auto min-h-dvh max-w-md space-y-4 p-4 pb-24">{children}</main>
      <BottomNav items={customerNav(t)} />
    </>
  );
}
