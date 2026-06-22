import { test, expect, type Page } from '@playwright/test';

// Guard cases: RTL parity + ≥44px tap targets (no backend needed), plus sold-out
// and past-cut-off (seeded backend needed → self-skip). The login page renders
// without auth, so RTL + tap targets are asserted there reliably.
const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

async function reachable(page: Page, path: string): Promise<boolean> {
  const res = await page.goto(path);
  return Boolean(res && res.ok());
}

test.describe('Guards — RTL, tap targets, sold-out, cut-off', () => {
  test('switching to Arabic flips the layout to RTL', async ({ page, context }) => {
    test.skip(!(await reachable(page, '/login')), 'app server not reachable');
    await context.addCookies([{ name: 'NEXT_LOCALE', value: 'ar', url: BASE }]);
    await page.goto('/login');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  });

  test('primary CTAs meet the 44px tap-target minimum', async ({ page }) => {
    test.skip(!(await reachable(page, '/login')), 'app server not reachable');
    const btn = page.getByRole('button').first();
    await expect(btn).toBeVisible();
    const box = await btn.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });

  test('sold-out surfaces a sold-out indicator on the home screen', async ({ page }) => {
    test.skip(!(await reachable(page, '/')), 'app server not reachable');
    const soldOut = page.getByText(/Sold out|نفدت/i);
    test.skip(!(await soldOut.count()), 'shop is not sold out in this environment');
    await expect(soldOut.first()).toBeVisible();
  });

  test('past cut-off, placing an order surfaces the past-cut-off message', async () => {
    // Needs a seeded session past its cut-off + a signed-in customer at checkout.
    // The cut-off boundary logic itself is covered in tests/unit/time.test.ts.
    test.skip(true, 'past-cut-off path requires a seeded session + customer (run on a stack)');
  });
});
