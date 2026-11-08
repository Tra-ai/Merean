const CACHE = 'TRA-reader-v3';
const APP_SHELL = [
  '/', '/assets/TRA-logo.png', '/data/stories.json',
  '/assets/icon-192.png', '/assets/icon-512.png', '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith('TRA-reader-') && key !== CACHE).map((key) => caches.delete(key)),
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Let the browser handle audio byte ranges rather than caching partial files.
  if (request.headers.has('range') || url.pathname.endsWith('.mp3')) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then((cache) => cache.put('/', copy)));
      }
      return response;
    }).catch(async () => (await caches.match('/', { ignoreVary: true })) || Response.error()));
    return;
  }

  // Same-origin font preloads must match pre-cached files despite Vary: Origin.
  event.respondWith(caches.match(request, { ignoreVary: true }).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok) {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then((cache) => cache.put(request, copy)));
    }
    return response;
  })));
});