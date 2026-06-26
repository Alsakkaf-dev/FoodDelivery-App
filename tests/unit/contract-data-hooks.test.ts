import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Frozen `data-*` hook guard — Engineer #20 (Visual QA).
 *
 * The operator board / payment / rider / checkout components expose `data-*`
 * attributes that the Playwright e2e suites select on (operator.spec, order-board.spec,
 * rider.spec) and that the Shared Integration Contract §C freezes. This guard reads
 * each owner file as TEXT (no compile/mock needed, so it is resilient to restyle
 * churn) and asserts the hook is still present — a restyle that drops or renames a
 * hook fails fast at unit speed, before e2e, and is routed back to the owner via
 * QA/DEFECT_LOG.md. #20 updates a selector ONLY in lockstep with the owning engineer.
 *
 * Source of the file:line map: QA/AUDIT_MATRIX.md + the contract data-* inventory.
 */

const COODING = resolve(__dirname, '..', '..');
const source = (rel: string): string => readFileSync(resolve(COODING, rel), 'utf8');

const FROZEN_HOOKS: { file: string; attrs: string[] }[] = [
  { file: 'src/components/operator/board-column.tsx', attrs: ['data-column', 'data-count'] },
  { file: 'src/components/operator/order-chip.tsx', attrs: ['data-order-status', 'data-action', 'data-advance-to'] },
  { file: 'src/components/operator/payment-actions.tsx', attrs: ['data-refusable', 'data-verdict', 'data-action'] },
  { file: 'src/components/operator/menu-editor.tsx', attrs: ['data-can-save', 'data-available'] },
  { file: 'src/components/operator/broadcast-form.tsx', attrs: ['data-can-send'] },
  { file: 'src/components/operator/state-controls.tsx', attrs: ['data-shop-status'] },
  { file: 'src/app/(rider)/rider/[id]/page.tsx', attrs: ['data-payment'] },
  { file: 'src/components/customer/payment-section.tsx', attrs: ['data-can-place'] },
];

describe('contract: frozen data-* Playwright hooks survive every restyle', () => {
  for (const { file, attrs } of FROZEN_HOOKS) {
    for (const attr of attrs) {
      it(`${file} still exposes ${attr}`, () => {
        expect(
          source(file),
          `${attr} missing from ${file} — an e2e selector would break; route to the owner before changing the test`,
        ).toContain(attr);
      });
    }
  }
});
