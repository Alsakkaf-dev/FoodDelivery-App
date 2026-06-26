import type { Config } from 'tailwindcss';

/**
 * Fahman Orders — design tokens (NEW orange/amber design system).
 * SINGLE SOURCE OF TRUTH — Plan 01. Consumers use Tailwind token classes only;
 * no component hardcodes hex / px radii / shadows.
 * Frozen interface: The_Master_Plan/FOUNDATION_CONTRACTS.md §1.
 * Human-readable map: The_Master_Plan/TOKENS_REFERENCE.md.
 *
 * Legacy keys (rust / slate / muted / cream / line) are RECOLORED IN PLACE to the
 * new palette so existing `text-rust` / `bg-cream` / `border-line` consumers adopt
 * the new look with ZERO component edits. `rust` is NOT renamed to `brand`
 * (cross-surface refs preserved per Contract §B); `brand` is added as the canonical
 * new alias. Legacy status keys (open / soldout / teal) are kept untouched —
 * status.tsx still consumes them; migrating their semantics is #02's call.
 */
