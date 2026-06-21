import Link from 'next/link';
import { formatMYR } from '@/lib/utils/money';
import type { MenuItem } from '@/types/db';

// CMP — customer menu card (FR-C-04). Photo via background-image so no remote-image
// config is needed; falls back to an emoji when there is no photo.
export function MenuCard({ item, lang }: { item: MenuItem; lang: 'en' | 'ar' }) {
  const ar = lang === 'ar';
  const name = ar ? item.name_ar : item.name_en;
  const desc = ar ? item.description_ar : item.description_en;

  const inner = (
    <div className={`card flex gap-3 ${item.available ? '' : 'opacity-60'}`}>
      <div
        className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-control bg-cream bg-cover bg-center text-2xl"
        style={item.photo_url ? { backgroundImage: `url(${item.photo_url})` } : undefined}
        aria-hidden
      >
        {item.photo_url ? '' : '🌯'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate">{name}</h3>
          <span className="shrink-0 font-bold text-rust">{formatMYR(item.price, lang)}</span>
        </div>
        {desc ? <p className="mt-0.5 line-clamp-2 text-sm text-muted">{desc}</p> : null}
        {!item.available ? (
          <span className="badge mt-1 bg-muted/15 text-muted">{ar ? 'غير متوفر' : 'Unavailable'}</span>
        ) : null}
      </div>
    </div>
  );

  return item.available ? (
    <Link href={`/menu/${item.id}`} className="block min-h-[44px]">
      {inner}
    </Link>
  ) : (
    <div className="min-h-[44px]">{inner}</div>
  );
}
