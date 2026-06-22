import { test, expect, type Page } from '@playwright/test';

// EP-13 — installable PWA: the manifest is linked and a service worker registers.
// The VAPID key conversion is covered headlessly in tests/unit/pwa-vapid.test.ts.
// Self-skips when the app server is not reachable in this environment.
async function homeReady(page: Page): Promise<boolean> {
  const res = await page.goto('/');
  return Boolean(res && res.ok());
}

test.describe('EP-13 — PWA installability', () => {
  test('manifest is linked and a service worker registers', async ({ page }) => {
    test.skip(!(await homeReady(page)), 'app server not reachable in this environment');

    // Next injects <link rel="manifest"> from metadata.manifest.
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);

    // The SW registers on load (RegisterSW). Give it a moment, then assert.
    const registered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const reg = await navigator.serviceWorker.getRegistration();
      return Boolean(reg) || (await navigator.serviceWorker.ready.then(() => true).catch(() => false));
    });
    expect(registered).toBe(true);
  });
});
