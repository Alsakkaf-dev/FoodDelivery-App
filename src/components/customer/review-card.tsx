import { ReviewCard as UIReviewCard, Avatar } from '@/components/ui';
import type { Review } from '@/app/(customer)/reviews/sample-reviews';

// Engineer #13 — feature wrapper around the shared ReviewCard primitive.
// Per ruling R-7 the ReviewCard primitive is owned by #02 (ui/cards.tsx); this file
// COMPOSES it (never forks). Verified against ui/cards.tsx: the primitive renders
// { author, avatar(node), date, rating, comment } and has no separate title slot — so
// the localized review title is folded into the comment as a bold lead-in (matching
// the mock's "bold headline → muted body"). The avatar is the shared Avatar primitive
// with an initials-on-peach fallback (reviews carry no photo).

type Props = {
  review: Review;
  locale: 'en' | 'ar';
};

export function ReviewCard({ review, locale }: Props) {
  const ar = locale === 'ar';
  const title = ar ? review.title_ar : review.title_en;
  const body = ar ? review.body_ar : review.body_en;

  return (
    <UIReviewCard
      author={review.author}
      avatar={<Avatar name={review.author} src={review.avatarUrl} backdrop size="md" />}
      date={review.date}
      rating={review.rating}
      comment={
        <>
          <span className="font-bold text-ink">{title}</span> {body}
        </>
      }
    />
  );
}
