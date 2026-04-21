// Service Worker — Workout App
// Cache-first for own assets, stale-while-revalidate for CDN/fonts.

const CACHE = 'workout-v19';

const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './styles/main.css',
  './scripts/data.js',
  './scripts/components.jsx',
  './scripts/Onboarding.jsx',
  './scripts/HomeScreen.jsx',
  './scripts/ProgramScreen.jsx',
  './scripts/WorkoutScreen.jsx',
  './scripts/HistoryAndProfile.jsx',
  './scripts/App.jsx',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
];

// Precache app shell on install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

// Delete old caches on activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Own origin — cache-first, fall back to network and cache the response
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // CDN (unpkg) and Google Fonts — stale-while-revalidate
  const isCDN = url.hostname === 'unpkg.com'
    || url.hostname === 'fonts.googleapis.com'
    || url.hostname === 'fonts.gstatic.com';

  if (isCDN) {
    event.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(request).then(cached => {
          const fetchPromise = fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          }).catch(() => cached); // offline fallback: serve stale
          return cached || fetchPromise;
        })
      )
    );
  }
});
