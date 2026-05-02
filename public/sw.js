self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('foncierchain-store').then((cache) => cache.addAll([
      '/',
      '/portal',
      '/index.html',
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});
