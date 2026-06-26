'use client';
import { useRouter } from 'next/navigation';
import { CategoryChip, CategoryPhotoCard } from '@/components/ui';
import type { IconName } from '@/components/icons';

// SCR-C-01 — All-Categories row (Home V / V-1 / V-2). Data-driven so #08
// (Search/Categories) can reuse the exact discovery pattern. Two density variants:
// `chip` = CategoryChip (icon + label, active = gradient disc) for Home V;
// `photo` = CategoryPhotoCard (circular media + name + optional sub-caption) for
// Home V-1/V-2. Horizontally scrollable, edge-bleeding, RTL-mirrored.
//
// Client component: CategoryChip is a button (no href), so navigation is wired via
// the router; CategoryPhotoCard is a link and uses href directly.
export type HomeCategory = {
  key: string;
  label: string;
  href: string;
  icon?: IconName; // chip variant
  media?: React.ReactNode; // photo variant — consumer supplies the image element
  subtitle?: string; // photo variant sub-caption, e.g. "Starting at RM12"
  active?: boolean;
};

export function CategoryRow({
  categories,
  variant = 'chip',
}: {
  categories: HomeCategory[];
  variant?: 'chip' | 'photo';
}) {
  const router = useRouter();
  return (
    <div
      role="list"
      className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {categories.map((c) =>
        variant === 'photo' ? (
          <CategoryPhotoCard
            key={c.key}
            href={c.href}
            media={c.media}
            name={
              c.subtitle ? (
                <span className="flex flex-col">
                  <span>{c.label}</span>
                  <span className="text-caption text-muted">{c.subtitle}</span>
                </span>
              ) : (
                c.label
              )
            }
          />
        ) : (
          <CategoryChip
            key={c.key}
            icon={c.icon ?? 'utensils'}
            label={c.label}
            active={c.active}
            onClick={() => router.push(c.href)}
          />
        ),
      )}
    </div>
  );
}
