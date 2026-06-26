'use client';
import type { Zone } from '@/types/db';
import { EmptyState } from '@/components/ui/states';

// SCR-C-05 step 1 — active-zone selector (US-015 / FR-C-07). The server page
// sources zones via `listZones(true)`, so every zone here is already active;
// picking one sets the checkout draft `zone_id`. Radio rows, ≥44px tap targets,
// RTL-safe via logical `text-start`. Bilingual inline (matches the other customer
// screens). Imports ONLY ui/states so checkout-gate.test.ts runs standalone.
