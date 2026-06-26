'use client';
import { useState } from 'react';
import { Avatar, FilledInput, PrimaryButton, IconButton } from '@/components/ui';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// Edit Profile — centered avatar with an orange edit-FAB (overlaid, RTL-anchored
// to the logical end/bottom) + filled inputs (name/email/phone/bio) + a SAVE CTA.
//
// There is NO updateProfile server action and no email/bio/avatar column (frozen
// domain — consolidated backend request filed in TEAM_STATUS.md). So SAVE is an
// honest client-side optimistic stub: it confirms inline ("saved_demo") without
// claiming a real write. Phone is read-only (it's the account identity key).
// When the backend lands, wire `onSave` to the real action; the UI is unchanged.
