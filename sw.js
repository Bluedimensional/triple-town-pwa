// sw.js — service worker: cache the app shell so the game launches offline.
//
// Bump CACHE version whenever shipped files change so clients pick up the update.

const CACHE = 'tripletown-v12';

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

// Cache-first for our own assets; network fallback for everything else.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // Runtime-cache same-origin GETs so subsequent loads work offline.
          if (res && res.ok && new URL(req.url).origin === self.location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
    })
  );
});
