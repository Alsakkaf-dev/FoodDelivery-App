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

