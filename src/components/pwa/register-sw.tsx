'use client';
import { useEffect } from 'react';

// Registers the service worker (/sw.js) once the page has loaded. Replaces the
// inline registration script in the root layout with a proper client component
// (FR-S-11, NFR-C-04). No-ops where service workers are unavailable.
export function RegisterSW() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* registration is best-effort; the app works without it */
      });
    };
    if (document.readyState === 'complete') register();
    else {
      window.addEventListener('load', register);
      return () => window.removeEventListener('load', register);
    }
  }, []);
  return null;
}
