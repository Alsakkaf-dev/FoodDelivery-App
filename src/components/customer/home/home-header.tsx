import Link from 'next/link';
import { Icon } from '@/components/icons';
import { CartBadge } from '@/components/ui/cart-badge';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// Time-of-day greeting resolved server-side from MYT hour (no name on the public
// home — AUTH_DISABLED), so SSR is deterministic and there is no hydration flash.
function timeGreeting(hour: number, t: Dictionary): string {
  if (hour < 12) return t.greet_morning;
  if (hour < 17) return t.greet_afternoon;
  return t.greet_evening;
}

// SCR-C-01 — Home header: leading menu → /account (R-4), centered deliver-to
// (links to the address book #14), trailing live cart (CartBadge, #04, import
// only), and the greeting line. All copy from the dictionary; logical props mirror
// the whole row under dir=rtl.
export function HomeHeader({ t, hour }: { t: Dictionary; hour: number }) {
  return (
    <header className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        {/* Navigational menu → /account (R-4). IconButton (#02) is button-only, so
            this uses an accessible styled Link, not a forked button primitive. */}
        <Link
          href="/account"
          aria-label={t.account}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-surface-alt text-ink"
        >
          <Icon name="menu" aria-hidden />
        </Link>

        <Link
          href="/account/addresses"
          aria-label={t.home_deliver_to}
          className="flex flex-1 flex-col items-center"
        >
          <span className="text-label uppercase text-brand">{t.home_deliver_to}</span>
          <span className="flex items-center gap-1 text-title text-ink">
            {t.home_location_default}
            <Icon name="chevron-down" className="text-muted" aria-hidden />
          </span>
        </Link>

        {/* Live cart (#04, import only). Inline (non-floating) for the header slot. */}
        <CartBadge openLabel={t.cart_open} countLabel={t.cart_items_count} floating={false} />
      </div>

      <p className="text-h2 text-ink">
        <span className="font-medium text-body">{t.greet_lead} </span>
        <span className="font-bold">{timeGreeting(hour, t)}</span>
      </p>
    </header>
  );
}
