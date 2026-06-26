import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { StatusBadge, OrderStatusChip, QtyCounter } from '@/components/ui/status';
import { Loading, EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { Stepper, LangToggle } from '@/components/ui/controls';
import { Timeline } from '@/components/ui/timeline';
import { BottomNav } from '@/components/ui/nav';
import type { IconName } from '@/components/icons';

// BottomNav reaches for the Next router + <Link>; stub both so it renders standalone.
vi.mock('next/navigation', () => ({ usePathname: () => '/' }));
vi.mock('next/link', () => ({ default: 'a' }));

const html = (el: ReturnType<typeof createElement>): string => renderToStaticMarkup(el);

describe('ui primitives: bilingual labels (en + ar)', () => {
  it('StatusBadge renders EN and AR shop status', () => {
    expect(html(createElement(StatusBadge, { status: 'open', lang: 'en' }))).toContain('Open');
    expect(html(createElement(StatusBadge, { status: 'open', lang: 'ar' }))).toContain('مفتوح');
    expect(html(createElement(StatusBadge, { status: 'sold_out', lang: 'en' }))).toContain('Sold out');
    expect(html(createElement(StatusBadge, { status: 'sold_out', lang: 'ar' }))).toContain('نفدت الكمية');
  });

  it('OrderStatusChip renders EN and AR order status', () => {
    expect(html(createElement(OrderStatusChip, { status: 'preparing', lang: 'en' }))).toContain('Preparing');
    expect(html(createElement(OrderStatusChip, { status: 'preparing', lang: 'ar' }))).toContain('قيد التحضير');
  });

  it('QtyCounter renders EN and AR remaining label with a progressbar', () => {
    const en = html(createElement(QtyCounter, { remaining: 3, total: 20, lang: 'en' }));
    expect(en).toContain('portions left');
    expect(en).toContain('role="progressbar"');
    expect(html(createElement(QtyCounter, { remaining: 3, total: 20, lang: 'ar' }))).toContain('حصة');
  });

  it('Timeline renders EN and AR step labels', () => {
    expect(html(createElement(Timeline, { status: 'preparing', lang: 'en' }))).toContain('Preparing');
    expect(html(createElement(Timeline, { status: 'preparing', lang: 'ar' }))).toContain('قيد التحضير');
  });

  it('LangToggle offers the other language label (en↔ar)', () => {
    expect(html(createElement(LangToggle, { current: 'en' }))).toContain('العربية');
    expect(html(createElement(LangToggle, { current: 'ar' }))).toContain('English');
  });
});

