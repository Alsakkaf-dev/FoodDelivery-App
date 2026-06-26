import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { MenuCard } from '@/components/customer/menu-card';
import type { MenuItem } from '@/types/db';

// MenuCard wraps available items in a Next <Link>; stub it so the card renders standalone.
vi.mock('next/link', () => ({ default: 'a' }));

const html = (el: ReturnType<typeof createElement>): string => renderToStaticMarkup(el);

const base: MenuItem = {
  id: 'm1',
  name_en: 'Chicken Shawarma',
  name_ar: 'شاورما دجاج',
  description_en: 'Grilled chicken, garlic sauce',
  description_ar: 'دجاج مشوي مع ثوم',
  price: 8.5,
  photo_url: null,
  available: true,
  sort_order: 1,
};

