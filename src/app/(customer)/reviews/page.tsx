import Link from 'next/link';
import { getI18n } from '@/lib/i18n/server';
import { EmptyState } from '@/components/ui/states';
import { Icon } from '@/components/icons';
import { ReviewCard } from '@/components/customer/review-card';
import { SAMPLE_REVIEWS } from './sample-reviews';

// SCR — Reviews (Engineer #13). Overlapping-avatar review cards with orange star
// rows. Reached from the My Orders header (the bottom nav is frozen — R-4). Renders
// from a local sample module today because no reviews backend exists yet; see the
// ledger request + sample-reviews.ts. The (customer) group owns the shell + nav.
export const dynamic = 'force-dynamic';

export default function ReviewsPage() {
  const { locale, t } = getI18n();
  const reviews = SAMPLE_REVIEWS;

  return (
    <>
      <header className="flex items-center gap-3">
        <Link
          href="/orders"
          aria-label={t.back}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-pill bg-surface-alt text-ink"
        >
          <Icon name="chevron-start" />
        </Link>
        <h1 className="text-h1 font-bold text-ink">{t.reviews}</h1>
      </header>

      {reviews.length === 0 ? (
        <EmptyState title={t.no_reviews} hint={t.no_reviews_hint} icon="⭐" />
      ) : (
        <ul className="space-y-6 pt-2">
          {reviews.map((r) => (
            <li key={r.id}>
              <ReviewCard review={r} locale={locale} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
