'use client';
import { Icon } from '@/components/icons';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// Search field (Search screen). Pill on bg-surface-input with a leading magnifier
// and a trailing clear-✕ that appears only when there is text. No dedicated
// "search input" primitive exists (FilledInput is a labeled form field), so this
// composes tokens + the shared <Icon> — it does not fork a primitive. The ✕ keeps
// a ≥44px hit area while staying visually small. RTL: `dir` follows the locale and
// the whole row mirrors via flow.
