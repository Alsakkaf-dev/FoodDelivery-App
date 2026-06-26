import { IconTile } from '@/components/ui';
import type { IconName } from '@/components/icons';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// Ingredients — decorative brand garnish. The flat menu has no per-item ingredient data,
// so these are icon-only tiles from a fixed brand set (no fabricated per-dish text). The
// section heading is the only copy and comes from the dictionary. The row scrolls
// horizontally and mirrors under RTL via logical padding.
const GLYPHS: IconName[] = ['wrap', 'drumstick', 'bowl', 'utensils', 'drink'];

export function IngredientsRow({ t }: { t: Dictionary }) {
  return (
    <section className="space-y-3">
      <h2 className="text-label uppercase text-muted">{t.ingredients}</h2>
      <ul className="flex gap-3 overflow-x-auto pb-1">
        {GLYPHS.map((g) => (
          <li key={g}>
            <IconTile icon={g} />
          </li>
        ))}
      </ul>
    </section>
  );
}
