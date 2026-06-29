// Service worker — offline-first precache of the app shell (TRD §serviceWorker).
// Cache name carries the app version; bump to invalidate.
const CACHE = 'collider-v0.6.0';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './icon.svg',
  './src/app.js',
  './src/cards.js',
  './src/config.js',
  './src/deckEngine.js',
  './src/streak.js',
  './src/domains.js',
  './src/storage.js',
  './src/telemetry.js',
  './src/provocation.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return; // never cache telemetry POSTs
  e.respondWith(
    caches.match(request).then((hit) => hit || fetch(request).then((res) => {
      // runtime-cache same-origin GETs so the app keeps working offline
      const copy = res.clone();
      if (res.ok && new URL(request.url).origin === self.location.origin) {
        caches.open(CACHE).then((c) => c.put(request, copy));
      }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
