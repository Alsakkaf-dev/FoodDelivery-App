#!/usr/bin/env node
// i18n parity checker — Plan #03 (Bilingual Dictionary Expansion & RTL Discipline).
//
// Guarantees the two dictionaries stay in lockstep so no screen ships a half-translated
// string. Fails (exit 1) on ANY of:
//   1. key-set divergence  — a key in en.json missing from ar.json (or vice-versa)
//   2. {{placeholder}} drift — a shared key whose {{var}} tokens differ between EN and AR
//   3. empty values        — a key whose value is "" / whitespace in either language
//   4. duplicate keys       — the same flat key declared twice in one file (JSON.parse
//                             would silently keep the last; we catch it in raw text)
//
// Zero dependencies — pure Node ESM. Run from anywhere:
//   node scripts/i18n-parity.mjs
// Exit code: 0 = identical & healthy, 1 = divergence (CI-ready).
//
// Note: en.json is the source-of-truth type (`Dictionary = typeof en` in dictionaries.ts);
// the compile-time guard there enforces ar ⊇ en at `tsc` time. This script is the runtime
// counterpart and additionally checks the en-only direction, placeholders, and empties.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const MESSAGES = join(here, '..', 'messages');
const FILES = { en: join(MESSAGES, 'en.json'), ar: join(MESSAGES, 'ar.json') };

const PLACEHOLDER = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

/** All {{var}} names inside a string, sorted & de-duped → comparable signature. */
function placeholders(value) {
  const found = new Set();
  for (const m of String(value).matchAll(PLACEHOLDER)) found.add(m[1]);
  return [...found].sort();
}

/** Flat-JSON duplicate-key scan (JSON.parse silently drops dupes, so scan raw text). */
