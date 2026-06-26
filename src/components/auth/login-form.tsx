'use client';
// SCR-C-08 / UC-C-01 — login for all roles. Two free channels: phone OTP (WhatsApp via
// the Supabase Send-SMS hook in prod) and email OTP (built-in). This is the REAL flow
// lifted from the old login/page.tsx — the API contract, role→route redirect, ?next and
// bilingual PDPA are PRESERVED verbatim; only the presentation moves into the new shell.
// AUTH_DISABLED stays untouched (no guards added here).
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import { Chip, FilledInput, PrimaryButton, TextAction } from '@/components/ui';
import { ConsentRow } from './consent-row';
import { RememberRow } from './remember-row';
import { SocialRow } from './social-row';
import { VerificationPanel } from './verification-panel';
import { Divider, ErrorNote } from './auth-bits';

type Method = 'phone' | 'email';

