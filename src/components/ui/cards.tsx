import type { ReactNode } from 'react';
import { cx } from './cx';
import { IconButton } from './buttons';
import { RatingRow } from './rating';

// Plan 02 — Card family. Token-driven, RTL-safe (logical props), copy-agnostic.
// Media is a slot (callers pass #05 <FoodImage/> or any node) so the CSS
// background-image pattern stays with #05; cards never hardcode imagery.
// All isomorphic (no hooks); interactivity comes from forwarded handlers.

/** Card — base surface (re-skinned `.card` from #01: white, lg radius, soft shadow). */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx('card', className)}>{children}</div>;
}

type LinkOrButton = { href?: string; onClick?: () => void };

function Surface({ href, onClick, className, children }: LinkOrButton & { className?: string; children: ReactNode }) {
  if (href) return <a href={href} className={className}>{children}</a>;
  if (onClick) return <button type="button" onClick={onClick} className={cx('text-start', className)}>{children}</button>;
  return <div className={className}>{children}</div>;
}

/**
 * ProductCard — photo-top dish/product card with name, price and a floating orange "+".
 * The add button is a sibling of the link surface (not nested) so the two tap targets
 * never overlap. `cornerAction` overrides the default add button.
 */
export function ProductCard({
  item, subtitle, onAdd, addLabel = 'Add', qty, href, cornerAction, disabled, className,
}: {
  item: { name: ReactNode; price?: ReactNode; media?: ReactNode; photoUrl?: string };
  subtitle?: ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  qty?: number;
  href?: string;
  cornerAction?: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cx('relative', className)}>
      <Surface href={href} className="card block h-full">
        {item.media ? (
          <div className="mb-3 overflow-hidden rounded-md">{item.media}</div>
        ) : item.photoUrl ? (
          <div
            role="img"
            aria-label=""
            className="mb-3 h-32 w-full rounded-md bg-cover bg-center"
            style={{ backgroundImage: `url("${item.photoUrl}")` }}
          />
        ) : null}
        <p className="truncate text-title font-bold text-ink">{item.name}</p>
        {subtitle ? <p className="mt-0.5 truncate text-caption text-muted">{subtitle}</p> : null}
        {item.price != null ? <p className="mt-2 text-h2 font-extrabold text-ink">{item.price}</p> : null}
      </Surface>
      <div className="absolute bottom-3 end-3">
        {cornerAction ?? (onAdd ? (
          <IconButton variant="add" icon="plus" aria-label={addLabel} onClick={onAdd} disabled={disabled} />
        ) : null)}
      </div>
      {qty ? (
        <span className="absolute start-3 top-3 rounded-pill bg-brand-tint px-2 py-0.5 text-caption font-bold text-brand">×{qty}</span>
      ) : null}
    </div>
  );
}

/** CategoryPhotoCard — photo with a name label over a bottom gradient scrim. */
export function CategoryPhotoCard({
  name, media, href, onClick, className,
}: {
  name: ReactNode;
  media?: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Surface href={href} onClick={onClick} className={cx('relative block overflow-hidden rounded-lg', className)}>
      {media}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-start text-title font-bold text-onColor">
        {name}
      </span>
    </Surface>
  );
}

/** RestaurantHeroCard — hero image + vendor name + meta row (pass a <MetaStat/>). */
export function RestaurantHeroCard({
  name, media, subtitle, meta, trailing, href, onClick, className,
}: {
  name: ReactNode;
  media?: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Surface href={href} onClick={onClick} className={cx('card block', className)}>
      {media ? <div className="mb-3 overflow-hidden rounded-lg">{media}</div> : null}
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-title font-bold text-ink">{name}</p>
          {subtitle ? <p className="mt-0.5 truncate text-caption text-muted">{subtitle}</p> : null}
          {meta ? <div className="mt-2">{meta}</div> : null}
        </div>
        {trailing}
      </div>
    </Surface>
  );
}

