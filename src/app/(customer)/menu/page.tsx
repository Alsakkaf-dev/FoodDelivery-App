import Link from 'next/link';
import { listMenu } from '@/lib/domain/menu';
import { getLocale } from '@/lib/i18n/server';
import { MenuCard } from '@/components/customer/menu-card';
import { EmptyState, ErrorState } from '@/components/ui/states';

// SCR-C-02 — bilingual menu list (FR-C-04). Public; no auth required.
export const dynamic = 'force-dynamic';

export default async function MenuPage() {
  const locale = getLocale();
  const ar = locale === 'ar';
  const res = await listMenu();

  return (
    <main className="mx-auto max-w-md space-y-4 p-4 pb-24">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-rust">{ar ? 'المنيو' : 'Menu'}</h1>
        <Link href="/" className="text-sm text-muted">
          {ar ? 'الرئيسية' : 'Home'}
        </Link>
      </header>

      {!res.ok ? (
        <ErrorState
          message={ar ? 'تعذّر تحميل المنيو. تأكّد من إعداد قاعدة البيانات.' : 'Couldn’t load the menu. Check the database setup.'}
        />
      ) : res.data.length === 0 ? (
        <EmptyState
          title={ar ? 'لا يوجد منيو بعد' : 'No items yet'}
          hint={ar ? 'شغّل supabase/setup.sql لإضافة المنيو والبيانات.' : 'Run supabase/setup.sql to add the menu and data.'}
        />
      ) : (
        <div className="space-y-3">
          {res.data.map((item) => (
            <MenuCard key={item.id} item={item} lang={locale} />
          ))}
        </div>
      )}
    </main>
  );
}
