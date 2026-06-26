import { getI18n } from '@/lib/i18n/server';
import { OfflineBanner } from '@/components/ui/states';
import { BottomNav } from '@/components/ui/nav';
import { CartBadge } from '@/components/ui/cart-badge';
import { LangSwitch } from '@/components/ui/lang-switch';
import { customerNav, customerFab } from '@/lib/nav/items';

// Customer route-group shell: offline banner on top, the standard max-w-md `main`
// frame, the public LangSwitch (US-012 — the only language control on public pages,
// kept mounted per R-4), the v2 bottom nav (4 destinations + center "+" FAB) and a
// floating cart badge. Locale + `dir` are inherited from the root layout (set on
// <html> from NEXT_LOCALE). No auth gate. The bottom padding (`pb-28`) clears the
// taller floating nav + its overhanging FAB. The floating CartBadge is suppressed on
// the home route (Plan 07 places an inline cart in its header) and on /cart & /checkout*
// where it is redundant; it shows on the other customer screens once the cart is non-empty.
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
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
      <CartBadge
        floating
        hideOnRoutes={['/', '/cart', '/checkout']}
        openLabel={t.cart_open}
        countLabel={t.cart_items_count}
      />
      <BottomNav items={customerNav(t)} fab={customerFab(t)} />
    </>
  );
}
