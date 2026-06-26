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
export function CartBadge({
  openLabel,
  countLabel,
  floating = false,
  hideOnRoutes,
  className,
}: {
  /** aria-label for the control (e.g. t.cart_open). */
  openLabel: string;
  /** aria-label template with `{{n}}` for the live count (e.g. t.cart_items_count). */
  countLabel?: string;
  /** Pin above the bottom nav instead of rendering in-flow. */
  floating?: boolean;
  /** When floating, hide on these route prefixes — the shell passes the routes that
   *  own their own cart affordance (home header) or where it's redundant (cart/checkout). */
  hideOnRoutes?: string[];
  className?: string;
}) {
  const { itemCount, hydrated } = useCart();
  const path = usePathname();

  if (!hydrated || itemCount <= 0) return null;
  if (
    floating &&
    hideOnRoutes?.some((r) => path === r || (r !== '/' && path.startsWith(r)))
  ) {
    return null;
  }

  const aria = countLabel ? countLabel.replace('{{n}}', String(itemCount)) : openLabel;

  return (
    <Link
      href="/cart"
      aria-label={aria}
      className={cx(
        'relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-dark-cta text-white shadow-card',
        floating && 'fixed bottom-28 end-4 z-40',
        className,
      )}
    >
      <Icon name="cart" />
      <Badge count={itemCount} aria-label={aria} className="absolute -top-1 -end-1" />
    </Link>
  );
}
