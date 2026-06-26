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
