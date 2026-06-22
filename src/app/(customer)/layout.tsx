import { getI18n } from '@/lib/i18n/server';
import { OfflineBanner } from '@/components/ui/states';
import { BottomNav } from '@/components/ui/nav';
import { LangSwitch } from '@/components/ui/lang-switch';
import { customerNav } from '@/lib/nav/items';

// Customer route-group shell (mirrors the rider page frame): offline banner on
// top, the standard max-w-md `main` frame, and the customer bottom nav. Locale
// and `dir` are inherited from the root layout (set on <html> from NEXT_LOCALE);
// the shell mounts the public LangSwitch so every customer screen can switch
// language (the only language control on public pages — US-012). No auth gate.
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = getI18n();
  return (
    <>
      <OfflineBanner label={t.offline} />
      <main className="mx-auto min-h-dvh max-w-md space-y-4 p-4 pb-24">
        <div className="flex justify-end">
          <LangSwitch current={locale} />
        </div>
        {children}
      </main>
      <BottomNav items={customerNav(t)} />
    </>
  );
}
