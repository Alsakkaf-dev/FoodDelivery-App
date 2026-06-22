import { test, expect, type Page } from '@playwright/test';

// US-032 / FR-O-09 — a newly placed order appears in the New column within ~2s
// over the board:orders realtime channel, with no refresh.
//
// This is a live-data e2e: it needs an operator session and a reachable Supabase
// (realtime + an order to insert). When the board redirects to /login (no operator
// session configured in this environment) the test skips with a clear reason —
// the transition legality + grouping are covered headlessly in
// tests/unit/order-board.test.ts. Day-5 task 5-2 runs this against a seeded stack.
async function onBoard(page: Page): Promise<boolean> {
  await page.goto('/operator/board');
  await page.waitForLoadState('domcontentloaded');
  return !/\/login/.test(page.url());
}

test.describe('US-032 — live order insertion on the operator board', () => {
  test('a placed order shows up in the New column without a refresh', async ({ page, request }) => {
    test.skip(!(await onBoard(page)), 'operator session + Supabase required (run on a seeded stack)');

    // The board renders its lifecycle columns.
    const newColumn = page.locator('[data-column="new"]');
    await expect(newColumn).toBeVisible();
    const before = await newColumn.locator('[data-order-status="new"]').count();

    // Place an order through the API as a customer (the seed provides an open
    // session + menu). The board must reflect it live via the realtime channel.
    const res = await request.post('/api/orders', {
      headers: { 'Idempotency-Key': `e2e-${Date.now()}` },
      data: { type: 'pickup', payment_method: 'cod', items: [{ menu_item_id: '00000000-0000-0000-0000-000000000001', qty: 1 }] },
    });
    test.skip(!res.ok(), 'order API not available in this environment');

    await expect
      .poll(async () => newColumn.locator('[data-order-status="new"]').count(), { timeout: 4000 })
      .toBeGreaterThan(before);
  });
});
