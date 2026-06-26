'use client';
import { useCallback, useEffect, useState } from 'react';

// Recent search keywords persisted client-side (no backend). Namespaced under
// `fahman.*` like the cart store; private-mode / quota failures degrade to
// in-memory only. Most-recent-first, de-duplicated (case-insensitive), capped.
const KEY = 'fahman.search.recent.v1';
const MAX = 8;

function read(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr: unknown = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((s): s is string => typeof s === 'string').slice(0, MAX) : [];
  } catch {
    return [];
  }
}

function write(list: string[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* private mode / quota exceeded — keep in-memory only */
  }
}

export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([]);

  // Hydrate after mount so SSR markup matches the first client render.
  useEffect(() => {
    setRecent(read());
  }, []);

  const push = useCallback((term: string) => {
    const t = term.trim();
    if (!t) return;
    setRecent((prev) => {
      const next = [t, ...prev.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, MAX);
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setRecent([]);
    write([]);
  }, []);

  return { recent, push, clear };
}
