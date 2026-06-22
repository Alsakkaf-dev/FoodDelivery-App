import Link from 'next/link';
import { notFound } from 'next/navigation';
import { listMenu } from '@/lib/domain/menu';
import { getI18n } from '@/lib/i18n/server';
import { formatMYR } from '@/lib/utils/money';
import { AddToCart } from '@/components/customer/add-to-cart';

// SCR-C-03 — menu item detail (FR-C-04). Add-to-cart is wired into the client
// cart store (task-2-2). Public; no auth required.
export const dynamic = 'force-dynamic';

export default async function ItemPage({ params }: { params: { id: string } }) {
  const { locale, t } = getI18n();
  const ar = locale === 'ar';
  const res = await listMenu();
  const item = res.ok ? res.data.find((m) => m.id === params.id) : null;
  if (!item) notFound();

  const name = ar ? item.name_ar : item.name_en;
  const desc = ar ? item.description_ar : item.description_en;

  return (
    // The (customer) group layout owns the shell `main` frame + bottom nav.
    <>
      <Link href="/menu" className="inline-block text-sm text-muted">
        {ar ? '→ المنيو' : '← Menu'}
      </Link>

      <div
        className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-card bg-cream bg-cover bg-center text-6xl"
        style={item.photo_url ? { backgroundImage: `url(${item.photo_url})` } : undefined}
        aria-hidden
      >
        {item.photo_url ? '' : '🌯'}
      </div>

      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate">{name}</h1>
        <span className="shrink-0 text-xl font-bold text-rust">{formatMYR(item.price, locale)}</span>
      </div>

      {desc ? <p className="text-muted">{desc}</p> : null}

      {item.available ? (
        <AddToCart item={item} lang={locale} t={t} />
      ) : (
        <p className="badge bg-muted/15 text-muted">{ar ? 'غير متوفر حاليًا' : 'Currently unavailable'}</p>
      )}
    </>
  );
}
