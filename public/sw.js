/* Fahman Orders — minimal PWA service worker (free, no build step).
   Strategy: precache the app shell; network-first for navigations with an offline
   fallback so the live-status page still renders the last cached shell (NFR-C-04).
   Web Push: show notifications pushed from the server (FR-S-11). */
const CACHE = 'fahman-shell-v1';
const SHELL = ['/', '/offline', '/manifest.webmanifest'];

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
  if (request.method !== 'GET') return;
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
