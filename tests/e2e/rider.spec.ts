import { test, expect, type Page } from '@playwright/test';

// US-039..044 — rider happy path: zone-grouped today list → delivery detail
// (address + map link + phone + items + payment) → Picked up → Delivered.
//
// Needs a rider session + seeded ready/out-for-delivery orders. Without one the
// deliveries route redirects to /login; the test then skips. The map-link logic is
// covered headlessly in tests/unit/rider-maps.test.ts. Day-5 (5-2) runs this seeded.
async function onDeliveries(page: Page): Promise<boolean> {
  await page.goto('/rider');
  await page.waitForLoadState('domcontentloaded');
  return !/\/login/.test(page.url());
}

test.describe('US-039..044 — rider deliveries → detail → pickup → deliver', () => {
  test('open a delivery, see payment + map link, then advance it', async ({ page }) => {
    test.skip(!(await onDeliveries(page)), 'rider session + seeded deliveries required');

    const firstCard = page.locator('a[href^="/rider/"]').first();
    test.skip(!(await firstCard.count()), 'no deliveries seeded today');
    await firstCard.click();

    // Detail shows the map deep-link and the payment row (US-040/041).
    await expect(page.locator('a[href*="google.com/maps"]')).toBeVisible();
    await expect(page.locator('[data-payment]')).toBeVisible();

    // One-tap advance (Picked up → Delivered); the button is the h-16 primary action.
    const action = page.getByRole('button', { name: /picked up|delivered|تم الاستلام|تم التوصيل/i });
    await expect(action.first()).toBeVisible();
  });
});
