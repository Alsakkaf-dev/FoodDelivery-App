import { test, expect, type Page } from '@playwright/test';
import en from '../../messages/en.json';

// Operator UAT — setup → open shop → advance a live order on the board.
// Needs a seeded operator session; without one /operator redirects to /login and
// the test skips. Transition legality + board grouping are covered headlessly in
// tests/unit/order-board.test.ts.
async function asOperator(page: Page): Promise<boolean> {
  await page.goto('/operator');
  await page.waitForLoadState('domcontentloaded');
  return !/\/login/.test(page.url());
}

test.describe('Operator journey — dashboard → setup → board', () => {
  test('dashboard shows the shop controls and links to setup/board', async ({ page }) => {
    test.skip(!(await asOperator(page)), 'operator session required (seeded stack)');
    await expect(page.getByText(new RegExp(`${en.open_shop}|${en.close_shop}`, 'i')).first()).toBeVisible();
  });

  test('the board screen renders (columns when orders exist, else empty state)', async ({ page }) => {
    test.skip(!(await asOperator(page)), 'operator session required (seeded stack)');
    await page.goto('/operator/board');
    // Either the New column (orders present) or the no-orders empty state shows.
    await expect(
      page.locator('[data-column="new"]').or(page.getByText(new RegExp(en.no_orders, 'i')).first()),
    ).toBeVisible();
  });
});
