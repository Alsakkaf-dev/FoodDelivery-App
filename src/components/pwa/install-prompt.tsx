'use client';
import { useEffect, useState } from 'react';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { PrimaryButton, IconButton } from '@/components/ui';

// A2HS install prompt (EP-13). Captures `beforeinstallprompt`, then shows a
// dismissible bilingual bottom-sheet with an Install button that calls prompt().
// Logic (capture + install) is a FROZEN behavior contract — restyle only.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

