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

describe('ui primitives: the four UI states render from the shared kit', () => {
  it('Loading shows the caller-translated label in a polite live region', () => {
    const out = html(createElement(Loading, { label: 'جارٍ التحميل…' }));
    expect(out).toContain('جارٍ التحميل…');
    expect(out).toContain('role="status"');
  });

  it('EmptyState shows the title and hint', () => {
    const out = html(createElement(EmptyState, { title: 'لا توجد طلبات', hint: 'ستظهر طلباتك هنا' }));
    expect(out).toContain('لا توجد طلبات');
    expect(out).toContain('ستظهر طلباتك هنا');
  });

  it('ErrorState shows the message', () => {
    expect(html(createElement(ErrorState, { message: 'تعذر التحميل' }))).toContain('تعذر التحميل');
  });

  it('Skeleton renders the requested number of shimmer bars', () => {
    const out = html(createElement(Skeleton, { lines: 3 }));
    expect((out.match(/animate-pulse/g) ?? []).length).toBe(3);
    expect(out).toContain('aria-busy="true"');
  });
});

describe('ui primitives: >=44px tap targets (EP-13)', () => {
  it('Stepper +/- controls carry the 44px tap-target utilities', () => {
    const out = html(createElement(Stepper, { value: 1, onChange: () => {} }));
    expect(out).toContain('min-h-tap');
    expect(out).toContain('min-w-tap');
    expect(out).toContain('aria-label="decrease"');
    expect(out).toContain('aria-label="increase"');
  });

  it('BottomNav items carry the 44px min-height tap target', () => {
    // Icons are IconName strings (#04 BottomNav v2 resolves them via #05's <Icon name>),
    // so emoji literals would throw on an unknown registry key — use real names. The
    // assertions (min-h-tap, 'Home') are unchanged. Lockstep with #04 (ledger ACTION-NEEDED).
    const items: { href: string; label: string; icon: IconName }[] = [
      { href: '/', label: 'Home', icon: 'home' },
      { href: '/menu', label: 'Menu', icon: 'utensils' },
    ];
    const out = html(createElement(BottomNav, { items }));
    expect(out).toContain('min-h-tap');
    expect(out).toContain('Home');
  });
});
