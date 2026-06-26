'use client';
import { useState, useTransition } from 'react';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { ApiResult } from '@/lib/utils/api';
import { broadcastSchema } from '@/lib/utils/schemas';
import { cx, FilledInput, PrimaryButton } from '@/components/ui';

// SCR-O-06 — bilingual broadcast composer (US-038, FR-O-12). Two textareas
// (English + Arabic, the AR one RTL); submitting fans out once per opted-in
// customer in their language via `broadcast`. Re-skinned to the new design
// language (shared #02 FilledInput/PrimaryButton, #01 tokens) while keeping the
// daily-cap `rate_limited` error, the success send count, the `data-can-send`
// hook and the schema-mirrored client gate. Prop-driven (the server action
// arrives as `send`) so it stays testable without the DB.

export type BroadcastAction = (input: { message_en: string; message_ar: string }) => Promise<ApiResult<{ count: number }>>;

