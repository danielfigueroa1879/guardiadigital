// Service Worker para Guardia Digital PWA
const CACHE_NAME = 'guardia-digital-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/chatbot.js',
  '/firebase-counter.js',
  '/menu-script.js',
  '/pwa-install.js',
  '/fotos/logo.png',
  '/fotos/favicon-96x96.png',
  '/fotos/apple-touch-icon.png',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@200;400;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Instalar el Service Worker
self.addEventListener('install', function(event) {
  console.log('🔧 Instalando Service Worker v3...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('✅ Cache abierto');
        return cache.addAll(urlsToCache.map(function(url) {
          return new Request(url, {cache: 'reload'});
        }));
      })
      .catch(function(error) {
        console.error('❌ Error al cachear recursos:', error);
      })
  );
  self.skipWaiting();
});

// Interceptar solicitudes de red
self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension://')) return;
  if (event.request.url.includes('firebaseio.com')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(
          function(response) {
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            if (event.request.url.startsWith(self.location.origin)) {
              var responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(function(cache) {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          }
        ).catch(function(error) {
          console.error('❌ Error en fetch:', error);
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Actualizar el Service Worker
self.addEventListener('activate', function(event) {
  console.log('🔄 Activando Service Worker v3...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('✅ Service Worker v3 activado');
      return self.clients.claim();
    })
  );
});

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
