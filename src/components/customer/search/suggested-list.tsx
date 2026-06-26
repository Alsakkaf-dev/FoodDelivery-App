import Link from 'next/link';
import { Icon } from '@/components/icons';
import { FoodImage } from '@/components/ui/food-image';
import { formatMYR } from '@/lib/utils/money';
import type { MenuItem } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// "Suggested" rows. The reference shows multi-restaurant rows with a ★ rating, but
// Fahman is single-shop with no rating data — so we render the real menu items as
// rows (thumbnail + name + real price) instead of fabricating ratings. Each row
// links to the existing item detail. `chevron-right` is in the auto-mirroring
// directional set, so it flips under dir=rtl on its own.
