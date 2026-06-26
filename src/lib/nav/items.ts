import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { IconName } from '@/components/icons';

// Per-role bottom-navigation destinations (CMP-U-14, Fig. 16-1) + the optional
// center "+" FAB config. Labels come from the dictionary — never hard-coded — so
// AR/EN both render and the nav mirrors under dir=rtl. Each role's nav lists only
// its own routes (US-002): the customer nav never points at /operator/* and vice
// versa. `icon` is a Plan 05 icon NAME (string union) so this file stays React-free
// and importable by the server components + the shell-nav unit tests; `nav.tsx`
// resolves the name to an <Icon> at render. The hrefs + labels here are FROZEN by
// shell-nav.test.ts (R-4) — only the emoji→icon-name swap changed.

export type NavItem = { href: string; label: string; icon: IconName };
export type NavFab = { href: string; label: string; icon: IconName };

/** Customer bottom nav: Home · Menu · Orders · History (hrefs frozen — R-4). */
export function customerNav(t: Dictionary): NavItem[] {
  return [
    { href: '/', label: t.home, icon: 'home' },
    { href: '/menu', label: t.menu, icon: 'utensils' },
    { href: '/orders', label: t.orders, icon: 'bag' },
    { href: '/history', label: t.order_history, icon: 'clock' },
  ];
}

/** Customer center "+" FAB → start a new order by browsing the menu. */
export function customerFab(t: Dictionary): NavFab {
  return { href: '/menu', label: t.nav_new, icon: 'plus' };
}

/** Operator bottom nav: Board · Setup · Menu · End of day (hrefs frozen — R-4). */
export function operatorNav(t: Dictionary): NavItem[] {
  return [
    { href: '/operator/board', label: t.order_board, icon: 'clipboard' },
    { href: '/operator/setup', label: t.daily_setup, icon: 'settings' },
    { href: '/operator/menu', label: t.menu_manager, icon: 'utensils' },
    { href: '/operator/end-of-day', label: t.end_of_day, icon: 'moon' },
  ];
}

/** Operator center "+" FAB → add/manage a menu item. */
export function operatorFab(t: Dictionary): NavFab {
  return { href: '/operator/menu', label: t.nav_new, icon: 'plus' };
}

/** Rider bottom nav: a single Deliveries destination (the only rider route today). */
export function riderNav(t: Dictionary): NavItem[] {
  return [{ href: '/rider', label: t.rider_deliveries, icon: 'scooter' }];
}
