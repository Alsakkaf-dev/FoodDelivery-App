'use client';
import { useEffect, useState } from 'react';

export type Direction = 'ltr' | 'rtl';

/**
 * Reads the document writing direction from `<html dir>` (set by the root layout from the locale).
 * SSR-safe: defaults to `ltr` / `sign: 1` on the server and first paint, then corrects on mount
 * and stays live if `dir` changes (locale switch). `sign` is +1 for LTR and -1 for RTL — multiply
 * any horizontal offset (translateX, slide-in distance, underline travel) by it so directional
 * motion mirrors correctly under `dir=rtl`. Vertical (sheet) and scale (pop) motion ignore it.
 */
export function useDirection(): { dir: Direction; sign: 1 | -1 } {
  const [dir, setDir] = useState<Direction>('ltr');
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const read = () =>
      setDir(document.documentElement.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr');
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });
    return () => observer.disconnect();
  }, []);
  return { dir, sign: dir === 'rtl' ? -1 : 1 };
}

/** Imperative direction read for non-React call sites. Safe on the server (returns 'ltr'). */
export function documentDirection(): Direction {
  if (typeof document === 'undefined') return 'ltr';
  return document.documentElement.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';
}
