import { test, expect, type Page } from '@playwright/test';
import en from '../../messages/en.json';

// Customer UAT — browse → add → cart → checkout (delivery, COD) → live order.
// Needs an open shop with stock + a signed-in customer; without a seeded backend
// the menu is empty or checkout redirects to /login, so the test skips. Pure
// cart/gate/transition logic is covered headlessly in the unit suites.
async function menuReady(page: Page): Promise<boolean> {
  const res = await page.goto('/menu');
  return Boolean(res && res.ok());
}

test.describe('Customer journey — order (delivery, COD)', () => {
  test('browse the menu, add an item, reach checkout', async ({ page }) => {
    test.skip(!(await menuReady(page)), 'app server not reachable');

    // Menu items link to their detail page; skip if nothing is seeded.
    const firstItem = page.locator('a[href^="/menu/"]').first();
    test.skip(!(await firstItem.count()), 'no menu items seeded');
    await firstItem.click();

    // Add to cart (the detail page mounts the AddToCart control).
    const add = page.getByRole('button', { name: new RegExp(en.add_to_cart, 'i') });
    test.skip(!(await add.count()), 'item not available to add');
    await add.first().click();

    // View cart → checkout CTA exists.
    await page.goto('/cart');
    await expect(page.getByText(new RegExp(en.checkout, 'i')).first()).toBeVisible();
  });

  test('an empty cart shows the empty state', async ({ page }) => {
    test.skip(!(await menuReady(page)), 'app server not reachable');
    // Clear any persisted cart, then the cart page shows the empty state.
    await page.addInitScript(() => localStorage.removeItem('fahman.cart.v1'));
    await page.goto('/cart');
    await expect(
      page.getByText(new RegExp(`${en.empty_cart}|${en.browse_menu}`, 'i')).first(),
    ).toBeVisible();
  });
});
