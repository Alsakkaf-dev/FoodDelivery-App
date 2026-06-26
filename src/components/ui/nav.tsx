'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/icons';
import type { NavItem, NavFab } from '@/lib/nav/items';

// CMP-U-14 — Bottom navigation v2. A rounded white floating bar with real line icons,
// a filled-orange active state, and an OPTIONAL center ringed-orange "+" FAB. The FAB
// is a SEPARATE slot (not a NavItem), so the per-role configs in nav/items.ts stay at
// four destinations and shell-nav.test.ts's frozen href/label set is preserved. Icons
// come from Plan 05 (<Icon name/>); their colour is inherited via currentColor from the
// tab's text-brand (active) / text-muted (inactive). Everything mirrors under dir=rtl
// (logical layout + flex source-order; the FAB is centred with logical insets). The bar
// sits at z-40 — below OfflineBanner (50) / InstallPrompt (60), per the frozen z-stack.

function isActive(path: string, href: string): boolean {
  return path === href || (href !== '/' && path.startsWith(href));
}

export function BottomNav({ items, fab }: { items: NavItem[]; fab?: NavFab }) {
  const path = usePathname();
  // With a FAB, split the destinations evenly around the centred "+"; without one,
  // all destinations sit in the left group and spread across the bar.
  const split = fab ? Math.ceil(items.length / 2) : items.length;
  const left = items.slice(0, split);
  const right = items.slice(split);

  const renderTab = (it: NavItem) => {
    const active = isActive(path, it.href);
    return (
      <Link
        key={it.href}
        href={it.href}
        aria-current={active ? 'page' : undefined}
        className={`flex min-h-tap flex-1 flex-col items-center justify-center gap-1 py-2 text-caption font-semibold ${
          active ? 'text-brand' : 'text-muted'
        }`}
      >
        <Icon name={it.icon} />
        <span>{it.label}</span>
      </Link>
    );
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md items-stretch justify-around rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] shadow-sheet">
      {left.map(renderTab)}
      {fab ? (
        <div className="relative flex w-16 flex-none items-stretch justify-center">
          <Link
            href={fab.href}
            aria-label={fab.label}
            className="absolute inset-x-0 -top-5 mx-auto flex h-14 w-14 min-h-tap min-w-tap items-center justify-center rounded-full bg-brand-tint p-1 shadow-floating"
          >
            <span className="flex h-full w-full items-center justify-center rounded-full bg-brand text-onColor">
              <Icon name={fab.icon} />
            </span>
          </Link>
        </div>
      ) : null}
      {right.map(renderTab)}
    </nav>
  );
}
