import { test, expect, type Page } from '@playwright/test';

/**
 * Responsive sweep — Engineer #20. Runs on `android` (Pixel 5), `desktop`, and the
 * #20 `mobile-narrow` (320px) + `tablet` (768px) projects (see playwright.config.ts).
 * Assertions are design-agnostic — true for any correct mobile-first layout — so they
 * hold across the redesign and across every viewport: no horizontal overflow, and a
 * >=44px primary tap target. Self-skips when the app server isn't reachable (preview /
 * AUTH_DISABLED parity with the other e2e specs).
 *
 * Per-screen visual-vs-spec + RTL + a11y-tree checks land in a11y.spec.ts /
 * rtl-parity.spec.ts as each owner's surface reaches DONE (Phase B/C).
 */
const ROUTES = ['/', '/menu', '/login'];

async function reachable(page: Page, path: string): Promise<boolean> {
  const res = await page.goto(path);
  return Boolean(res && res.ok());
}

test.describe('responsive: no horizontal overflow across viewports', () => {
  for (const route of ROUTES) {
    test(`${route} fits the viewport width (no horizontal scroll)`, async ({ page }) => {
      test.skip(!(await reachable(page, route)), 'app server not reachable');
      // The scrollable width must not exceed the visible width (allow 1px rounding).
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `horizontal overflow on ${route}`).toBeLessThanOrEqual(1);
    });
  }
});

test.describe('responsive: primary interactive targets meet 44px', () => {
  test('first visible button is a >=44px tap target', async ({ page }) => {
    test.skip(!(await reachable(page, '/login')), 'app server not reachable');
    const button = page.getByRole('button').first();
    test.skip(!(await button.count()), 'no button on the page');
    const box = await button.boundingBox();
    expect(box, 'button has a bounding box').not.toBeNull();
    if (box) expect(box.height).toBeGreaterThanOrEqual(44);
  });
});
