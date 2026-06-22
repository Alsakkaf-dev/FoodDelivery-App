'use client';
import { useSyncExternalStore } from 'react';
import { sumLines } from '@/lib/utils/money';
import type { MenuItem } from '@/types/db';

// US-013 / FR-C-05 — client-side cart. A line is a frozen snapshot of the menu
// item at add-time (name + unit price), mirroring the `order_items` shape that
// checkout (task-2-4) persists, so the price can't drift after it's in the cart.
export interface CartLine {
  menu_item_id: string;
  name_en: string;
  name_ar: string;
  unit_price: number;
  qty: number;
}

export interface CartState {
  lines: CartLine[];
}

export type CartAction =
  | { type: 'add'; item: MenuItem }
  | { type: 'increment'; id: string }
  | { type: 'decrement'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'clear' };

export const emptyCart: CartState = { lines: [] };

// Matches the Stepper cap (CMP-U-08) so the UI and store agree on a ceiling.
export const MAX_QTY = 50;

function lineFromItem(item: MenuItem): CartLine {
  return {
    menu_item_id: item.id,
    name_en: item.name_en,
    name_ar: item.name_ar,
    unit_price: item.price,
    qty: 1,
  };
}

// Pure reducer — the single source of cart truth. Exported and unit-tested
// directly (no React, no storage), independent of the React binding below.
export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const exists = state.lines.some((l) => l.menu_item_id === action.item.id);
      if (exists) {
        return {
          lines: state.lines.map((l) =>
            l.menu_item_id === action.item.id ? { ...l, qty: Math.min(MAX_QTY, l.qty + 1) } : l,
          ),
        };
      }
      return { lines: [...state.lines, lineFromItem(action.item)] };
    }
    case 'increment':
      return {
        lines: state.lines.map((l) =>
          l.menu_item_id === action.id ? { ...l, qty: Math.min(MAX_QTY, l.qty + 1) } : l,
        ),
      };
    case 'decrement':
      // Dropping to qty 0 removes the line (FR-C-05).
      return {
        lines: state.lines
          .map((l) => (l.menu_item_id === action.id ? { ...l, qty: l.qty - 1 } : l))
          .filter((l) => l.qty > 0),
      };
    case 'remove':
      return { lines: state.lines.filter((l) => l.menu_item_id !== action.id) };
    case 'clear':
      return emptyCart;
    default:
      return state;
  }
}

// Derived selectors (pure) — recomputed on every change so the UI count + total
// stay live (the acceptance criterion). Currency math goes through the money util.
export function itemCount(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.qty, 0);
}
export function total(lines: CartLine[]): number {
  return sumLines(lines);
}

// ── React binding: a tiny external store (no extra dependency) ───────────────
// Persisted to localStorage so the cart survives reloads and navigation. Reads
// happen post-mount (in `subscribe`) so the server and first client render agree
// (both empty) — no hydration mismatch — then the stored cart streams in.

const STORAGE_KEY = 'fahman.cart.v1';

interface Snapshot {
  lines: CartLine[];
  hydrated: boolean;
  error: boolean;
}

const SERVER_SNAPSHOT: Snapshot = { lines: [], hydrated: false, error: false };
let snapshot: Snapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist(lines: CartLine[]) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    }
  } catch {
    // Storage unavailable (private mode / quota) — the cart still works in memory.
  }
}

function isCartLine(x: unknown): x is CartLine {
  if (typeof x !== 'object' || x === null) return false;
  const l = x as Record<string, unknown>;
  return (
    typeof l.menu_item_id === 'string' &&
    typeof l.name_en === 'string' &&
    typeof l.name_ar === 'string' &&
    typeof l.unit_price === 'number' &&
    typeof l.qty === 'number' &&
    l.qty > 0
  );
}

function readStored(): CartLine[] {
  let raw: string | null = null;
  try {
    raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
  } catch {
    return []; // storage blocked — treat as empty, not an error
  }
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw); // invalid JSON throws → caught by hydrate()
  if (!Array.isArray(parsed) || !parsed.every(isCartLine)) {
    throw new Error('corrupt cart');
  }
  return parsed;
}

function hydrate() {
  if (snapshot.hydrated) return;
  try {
    snapshot = { lines: readStored(), hydrated: true, error: false };
  } catch {
    snapshot = { lines: [], hydrated: true, error: true };
  }
  emit();
}

function dispatch(action: CartAction) {
  const next = cartReducer({ lines: snapshot.lines }, action);
  snapshot = { lines: next.lines, hydrated: true, error: false };
  persist(next.lines);
  emit();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  hydrate(); // first client mount loads the persisted cart (post-commit → SSR-safe)
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): Snapshot {
  return snapshot;
}
function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

export interface CartApi {
  lines: CartLine[];
  itemCount: number;
  total: number;
  hydrated: boolean;
  error: boolean;
  add: (item: MenuItem) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

/** Subscribe to the cart from any client component (no provider needed). */
export function useCart(): CartApi {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    lines: snap.lines,
    itemCount: itemCount(snap.lines),
    total: total(snap.lines),
    hydrated: snap.hydrated,
    error: snap.error,
    add: (item) => dispatch({ type: 'add', item }),
    increment: (id) => dispatch({ type: 'increment', id }),
    decrement: (id) => dispatch({ type: 'decrement', id }),
    remove: (id) => dispatch({ type: 'remove', id }),
    clear: () => dispatch({ type: 'clear' }),
  };
}
