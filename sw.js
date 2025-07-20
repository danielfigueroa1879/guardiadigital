// Service Worker para Guardia Digital PWA
const CACHE_NAME = 'guardia-digital-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/chatbot.js',
  '/firebase-counter.js',
  '/menu-script.js',
  '/fotos/logo.png',
  '/fotos/favicon-96x96.png',
  '/fotos/apple-touch-icon.png',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@200;400;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Instalar el Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceptar solicitudes de red
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Si está en cache, devolverlo
        if (response) {
          return response;
        }
        
        // Si no, ir a la red
        return fetch(event.request).then(
          function(response) {
            // Verificar que tenemos una respuesta válida
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clonar la respuesta
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

// Actualizar el Service Worker
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
