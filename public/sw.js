/* Fahman Orders — minimal PWA service worker (free, no build step).
   Strategy: precache the app shell; network-first for navigations with an offline
   fallback so the live-status page still renders the last cached shell (NFR-C-04);
   stale-while-revalidate for the public menu/status GET data so the menu shell
   renders offline. Authed mutations (non-GET) and user-specific reads are never
   cached. Web Push: show notifications pushed from the server (FR-S-11). */
// Bumped v2→v3 for the brand reskin: the `activate` handler purges old caches so
// no client keeps the retired rust-themed shell. Precache the brand push icon too
// (used by the `push` handler below) so notifications render offline.
const CACHE = 'fahman-shell-v3';
const SHELL = ['/', '/menu', '/offline', '/manifest.webmanifest', '/icons/icon-192.png'];

// Public, cacheable GET data (stale-while-revalidate). NOT board/orders (user-specific).
function isStaleWhileRevalidate(url) {
  return url.pathname === '/api/status' || url.pathname.startsWith('/api/menu');
}

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

