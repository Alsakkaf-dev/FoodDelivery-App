'use client';
import Link from 'next/link';
import { useShopStatus } from '@/lib/realtime/hooks';
import { StatusBadge, QtyCounter } from '@/components/ui/status';
import { AUTH_DISABLED } from '@/lib/auth/dev-bypass';
import type { DailySession } from '@/types/db';

type Props = {
  initial: Pick<DailySession, 'status' | 'qty_remaining'>;
  qtyTotal: number;
  deliveryWindow: string | null;
  lang: 'en' | 'ar';
};

// SCR-C-01 — live status hero (FR-C-02/03). Server passes the initial status;
// useShopStatus keeps it live over the shop:status realtime channel.
export function StatusHero({ initial, qtyTotal, deliveryWindow, lang }: Props) {
  const live = useShopStatus(initial) ?? initial;
  const ar = lang === 'ar';
  const isOpen = live.status === 'open';
  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-muted">{ar ? 'حالة المتجر' : 'Shop status'}</span>
        <StatusBadge status={live.status} lang={lang} />
      </div>

      {isOpen && qtyTotal > 0 ? (
        <QtyCounter remaining={live.qty_remaining} total={qtyTotal} lang={lang} />
      ) : (
        <p className="text-sm text-muted">
          {live.status === 'sold_out'
            ? ar
              ? 'نفدت الكمية لليوم — نشوفكم بكرة 🙏'
              : 'Sold out for today — see you tomorrow 🙏'
            : ar
              ? 'المتجر مغلق حاليًا. مواعيد العمل ١:٠٠–٧:٠٠ مساءً.'
              : 'We’re closed right now. Hours: 1:00–7:00 PM.'}
        </p>
      )}

      {deliveryWindow ? (
        <p className="text-sm text-slate">
          <span className="font-semibold">{ar ? 'وقت التوصيل: ' : 'Delivery window: '}</span>
          {deliveryWindow}
        </p>
      ) : null}

      <div className="grid gap-2">
        <Link href="/menu" className="btn-primary text-center">
          {ar ? 'تصفّح المنيو' : 'Browse the menu'}
        </Link>
        {/* Sign-in is disabled for preview (lib/auth/dev-bypass.ts) — hide the
            CTA so it doesn't lead to the unused /login page. */}
        {!AUTH_DISABLED ? (
          <Link href="/login" className="btn-secondary text-center">
            {ar ? 'تسجيل الدخول' : 'Sign in'}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
