
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('v1').then(cache => cache.addAll([
      '/Gps-Cable-Loss-Calculator/index.html',
      '/Gps-Cable-Loss-Calculator/manifest.json',
      '/Gps-Cable-Loss-Calculator/icon-192x192.png',
      '/Gps-Cable-Loss-Calculator/icon-512x512.png',
      '/Gps-Cable-Loss-Calculator/icon-1024x1024.png'
    ]))
  );
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
