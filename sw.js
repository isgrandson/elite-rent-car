const CACHE_NAME = 'elite-rent-car-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com'
];

// Instalacija Service Worker-a
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache otvorena');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - služi fajlove iz cache-a kada nema interneta
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Vrati iz cache-a ako postoji
        if (response) {
          return response;
        }
        
        // Inače pokušaj da preuzmeš sa interneta
        return fetch(event.request).then(
          function(response) {
            // Provjeri da li je response valjan
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Kloniraj response jer je stream
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

// Aktivacija - obriši stare cache-ove
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Brišem stari cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
