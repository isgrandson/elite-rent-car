const CACHE_NAME = 'elite-rent-car-v2';
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
  console.log('Elite Rent Car - Service Worker instalacija');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache otvorena - Elite Rent Car v2');
        return cache.addAll(urlsToCache);
      })
      .catch(function(error) {
        console.log('Greška pri otvaranju cache-a:', error);
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
          console.log('Služim iz cache-a:', event.request.url);
          return response;
        }
        
        // Inače pokušaj da preuzmeš sa interneta
        console.log('Preuzimam sa interneta:', event.request.url);
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
        ).catch(function(error) {
          console.log('Fetch failed:', error);
          // Možeš vratiti fallback stranicu ovdje
        });
      })
    );
});

// Aktivacija - obriši stare cache-ove
self.addEventListener('activate', function(event) {
  console.log('Elite Rent Car - Service Worker aktivacija');
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

// Dodatni event listeneri za PWA funkcionalnosti
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync event (za buduće funkcionalnosti)
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    // Ovdje možeš dodati logiku za sinhronizaciju podataka
  }
});
