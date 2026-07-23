// sw.js — service worker: cache the app shell so the game launches offline.
//
// Bump CACHE version whenever shipped files change so clients pick up the update.

const CACHE = 'tripletown-v29';

const SHELL = [
  '.',
  'index.html',
  'manifest.json',
  'css/styles.css',
  'js/main.js',
  'js/config.js',
  'js/state.js',
  'js/match.js',
  'js/bears.js',
  'js/storehouse.js',
  'js/store.js',
  'js/persistence.js',
  'js/game.js',
  'js/render.js',
  'js/sprites.js',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/icon-180.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Network-first: always fetch the latest when online (so a refresh shows the
// newest build), and fall back to the cache only when offline.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        // Refresh the cache with the latest same-origin responses.
        if (res && res.ok && new URL(req.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req)) // offline — serve the cached copy
  );
});
