import { redirect } from 'next/navigation';
import { getI18n } from '@/lib/i18n/server';
import { requireRole, RoleError, homeForRole } from '@/lib/auth/roles';
import { OfflineBanner } from '@/components/ui/states';
import { BottomNav } from '@/components/ui/nav';
import { operatorNav } from '@/lib/nav/items';

// Operator route-group shell. Same frame as the customer/rider shells plus a
// second-layer RBAC guard (US-004, FR-S-12): `middleware.ts` already redirects
// non-operators away from /operator/*, and this re-asserts it at render time.
// Reads cookies (i18n) and the session (requireRole), so it renders dynamically.
export const dynamic = 'force-dynamic';

export default async function OperatorLayout({ children }: { children: React.ReactNode }) {
  const { t } = getI18n();

  try {
    await requireRole('operator');
  } catch (err) {
    if (err instanceof RoleError) {
      // unauthorized → sign in; wrong role → that role's home (homeForRole).
      redirect(err.code === 'unauthorized' ? '/login' : homeForRole('customer'));
    }
    throw err;
  }

  return (
    <>
      <OfflineBanner label={t.offline} />
      <main className="mx-auto min-h-dvh max-w-md space-y-4 p-4 pb-24">{children}</main>
      <BottomNav items={operatorNav(t)} />
    </>
  );
}
