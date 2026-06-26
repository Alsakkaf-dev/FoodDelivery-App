'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/cart/store';
import { Icon } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { cx } from '@/components/ui/cx';

// CMP-U — Customer cart badge. A dark circular cart button (Plan 02 dark-IconButton
// look, rendered as a navigational <Link>) carrying a live orange count from
// useCart().itemCount via the Plan 02 <Badge/>. Works two ways:
//   • inline (default) — the home header places it in-flow (Plan 07, Home V design);
//   • floating — the customer shell pins one above the bottom nav.
//
// Hydration-safe: the cart store reports `hydrated=false` on the server + the first
// client paint, so we render null until the persisted cart streams in — no SSR
// mismatch and no "0" flash. Hidden when the cart is empty. When floating it sits at
// z-40 (≤ OfflineBanner 50 / InstallPrompt 60, per the frozen z-stack) and uses logical
// insets (`end-*`) so it mirrors under dir=rtl; the Badge pill is symmetric.
