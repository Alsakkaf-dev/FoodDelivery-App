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
function duplicateKeys(raw) {
  const seen = new Set();
  const dupes = new Set();
  const keyLine = /^\s*"((?:[^"\\]|\\.)*)"\s*:/;
  for (const line of raw.split('\n')) {
    const m = line.match(keyLine);
    if (!m) continue;
    const key = m[1];
    if (seen.has(key)) dupes.add(key);
    else seen.add(key);
  }
  return [...dupes];
}

function load(locale) {
  const raw = readFileSync(FILES[locale], 'utf8');
  let json;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    console.error(`✗ ${locale}.json is not valid JSON: ${err.message}`);
    process.exit(1);
  }
  return { raw, json, keys: Object.keys(json) };
}

const en = load('en');
const ar = load('ar');

const enSet = new Set(en.keys);
const arSet = new Set(ar.keys);

const missingInAr = en.keys.filter((k) => !arSet.has(k));
const missingInEn = ar.keys.filter((k) => !enSet.has(k));

const placeholderDrift = [];
for (const key of en.keys) {
  if (!arSet.has(key)) continue;
  const a = placeholders(en.json[key]);
  const b = placeholders(ar.json[key]);
  if (a.join(',') !== b.join(',')) {
    placeholderDrift.push({ key, en: a, ar: b });
  }
}

const empties = [];
for (const [locale, d] of [['en', en], ['ar', ar]]) {
  for (const key of d.keys) {
    if (String(d.json[key]).trim() === '') empties.push({ locale, key });
  }
}

const dupesEn = duplicateKeys(en.raw);
const dupesAr = duplicateKeys(ar.raw);

const problems =
  missingInAr.length +
  missingInEn.length +
  placeholderDrift.length +
  empties.length +
  dupesEn.length +
  dupesAr.length;

console.log('— i18n parity check —');
console.log(`en.json: ${en.keys.length} keys   ar.json: ${ar.keys.length} keys`);

if (problems === 0) {
  console.log('✓ Dictionaries are in parity (identical key sets, matching placeholders, no empties or duplicates).');
  process.exit(0);
}

if (missingInAr.length) {
  console.error(`\n✗ ${missingInAr.length} key(s) in en.json missing from ar.json:`);
  for (const k of missingInAr) console.error(`    - ${k}`);
}
if (missingInEn.length) {
  console.error(`\n✗ ${missingInEn.length} key(s) in ar.json missing from en.json:`);
  for (const k of missingInEn) console.error(`    - ${k}`);
}
if (placeholderDrift.length) {
  console.error(`\n✗ ${placeholderDrift.length} key(s) with mismatched {{placeholders}}:`);
  for (const d of placeholderDrift) {
    console.error(`    - ${d.key}: en{{${d.en.join(', ')}}} vs ar{{${d.ar.join(', ')}}}`);
  }
}
if (empties.length) {
  console.error(`\n✗ ${empties.length} empty value(s):`);
  for (const e of empties) console.error(`    - ${e.locale}.json → ${e.key}`);
}
if (dupesEn.length) {
  console.error(`\n✗ duplicate key(s) in en.json: ${dupesEn.join(', ')}`);
}
if (dupesAr.length) {
  console.error(`\n✗ duplicate key(s) in ar.json: ${dupesAr.join(', ')}`);
}

console.error(`\n${problems} problem(s) found. Add the missing keys to BOTH messages/en.json and messages/ar.json.`);
process.exit(1);
