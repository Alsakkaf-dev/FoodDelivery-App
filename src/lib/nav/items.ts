import type { Dictionary } from '@/lib/i18n/dictionaries';

// Per-role bottom-navigation destinations (CMP-U-14, Fig. 16-1).
// Labels come from the dictionary — never hard-coded — so AR/EN both render
// and the nav mirrors under dir=rtl. Each role's nav lists only its own routes,
// which keeps the shells role-appropriate (US-002): the customer nav never
// points at /operator/* and vice versa.

export type NavItem = { href: string; label: string; icon: string };

/** Customer bottom nav: Home · Menu · Orders · Account/History. */
export function customerNav(t: Dictionary): NavItem[] {
  return [
    { href: '/', label: t.home, icon: '🏠' },
    { href: '/menu', label: t.menu, icon: '🔍' },
    { href: '/orders', label: t.orders, icon: '🛍️' },
    { href: '/history', label: t.order_history, icon: '👤' },
  ];
}

/** Operator bottom nav: Board · Setup · Menu · End of day. */
export function operatorNav(t: Dictionary): NavItem[] {
  return [
    { href: '/operator/board', label: t.order_board, icon: '📋' },
    { href: '/operator/setup', label: t.daily_setup, icon: '⚙️' },
    { href: '/operator/menu', label: t.menu_manager, icon: '🍽️' },
    { href: '/operator/end-of-day', label: t.end_of_day, icon: '🌙' },
  ];
}
