'use client';
// Sign Up — PREVIEW-ONLY. There is no password/sign-up backend and AUTH_DISABLED is on,
// so this faithfully reproduces the reference UI but NEVER calls a route or creates a
// session. Local validation only, with an honest "preview only" note pointing users to
// the real code-based sign-in on /login.
import { useState } from 'react';
import Link from 'next/link';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import { FilledInput, PrimaryButton, TextAction } from '@/components/ui';
import { SocialRow } from './social-row';
import { Divider, PreviewNote } from './auth-bits';

