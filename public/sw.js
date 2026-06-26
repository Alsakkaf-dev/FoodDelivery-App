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

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return; // never cache authed mutations
  const url = new URL(request.url);

  // Navigations: network-first, fall back to cached shell, then /offline.
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/offline'))),
    );
    return;
  }

  // Public menu/status data: stale-while-revalidate (instant from cache, refresh in bg).
  if (url.origin === self.location.origin && isStaleWhileRevalidate(url)) {
    e.respondWith(
      caches.open(CACHE).then(async (c) => {
        const cached = await c.match(request);
        const network = fetch(request)
          .then((res) => {
            c.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
    return;
  }

  // Everything else: cache-first, then network.
  e.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
});

self.addEventListener('push', (e) => {
  let data = { title: 'Fahman Orders', body: '', url: '/' };
  try { data = { ...data, ...e.data.json() }; } catch (_) {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', data: { url: data.url },
    }),
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || '/'));
});
