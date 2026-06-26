'use client';
import { useEffect, useMemo, useState } from 'react';
import type { DailySession, Zone } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import type { ApiResult } from '@/lib/utils/api';
import { configureSessionSchema, type ConfigureSessionInput } from '@/lib/utils/schemas';
import { Icon } from '@/components/icons';
import { cx, EmptyState, FilledInput, PrimaryButton } from '@/components/ui';

// SCR-O-02 — Daily setup form (US-026..029, FR-O-04..07).
// One form that persists today's total quantity, cut-off time, delivery window
// and the active delivery zones via `configureSession`. Re-skinned to the new
// design language (shared #02 FilledInput/PrimaryButton, #05 line icons, #01
// tokens) while keeping the schema-mirrored client gate, the offline gate and
// the role="switch"/aria-checked zone toggles. Kept prop-driven (the server
// action arrives as `action`) so it stays unit-testable without the DB.
// configureSession sets qty_remaining=qty_total and activates exactly the
// selected zones (deactivating the rest).
