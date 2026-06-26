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
