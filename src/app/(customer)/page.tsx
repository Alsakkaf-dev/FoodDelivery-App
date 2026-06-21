import { getStatus } from '@/lib/domain/session';
import { getLocale } from '@/lib/i18n/server';
import { StatusHero } from '@/components/customer/status-hero';

// SCR-C-01 — Customer home / live status (FR-C-02/03). Public; no auth required.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const locale = getLocale();
  const ar = locale === 'ar';
  const res = await getStatus();
  const s = res.ok
    ? res.data
    : { status: 'closed' as const, qty_remaining: 0, qty_total: 0, delivery_window: null };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-5 p-6">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-rust">Fahman Orders</h1>
        <p className="text-muted">
          {ar
            ? 'شاورما طازجة، توصيل لباب بيتك — جوهور'
            : 'Fresh shawarma, delivered to your door — Johor'}
        </p>
      </header>

      <StatusHero
        initial={{ status: s.status, qty_remaining: s.qty_remaining }}
        qtyTotal={s.qty_total}
        deliveryWindow={s.delivery_window}
        lang={locale}
      />

      <p className="text-center text-xs text-muted">فهمان أوردرز · Fahman Orders</p>
    </main>
  );
}
