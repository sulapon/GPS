
// ===== PWA Service Worker (Optimized for TIF Map Tiles) =====

const STATIC_CACHE = 'gps-pwa-static-v2';
const MAP_CACHE = 'map-tiles-cache';

const STATIC_ASSETS = [
  './',
  './index.html',
  './app.html',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png',
  './icon-1024x1024.png'
];

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Helper: check if request is TIF map resource
function isTifRequest(request) {
  try {
    const url = new URL(request.url);
    return url.pathname.toLowerCase().endsWith('.tif') ||
           url.pathname.toLowerCase().endsWith('.tiff');
  } catch(e) {
    return false;
  }
}

// Fetch strategy
self.addEventListener('fetch', event => {

  const req = event.request;

  // Only handle GET requests
  if (req.method !== 'GET') return;

  // ===== Cache-First for TIF map files =====
  if (isTifRequest(req)) {
    event.respondWith(
      caches.open(MAP_CACHE).then(async cache => {

        const cached = await cache.match(req);
        if (cached) {
          // instant return from cache
          return cached;
        }

        // fetch from network if not cached
        const response = await fetch(req);
        if (response && response.status === 200) {
          cache.put(req, response.clone());
        }
        return response;

      })
    );
    return;
  }

  // ===== Default strategy (cache first fallback) =====
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(networkRes => {
        return networkRes;
      });
    })
  );
});

// Support localTifFileData (blob/object URLs bypass)
// Service worker will not interfere with blob: or data: scheme
