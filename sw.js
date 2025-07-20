// Service Worker para Guardia Digital PWA
const CACHE_NAME = 'guardia-digital-v2';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './chatbot.js',
  './firebase-counter.js',
  './menu-script.js',
  './pwa-install.js',
  './fotos/logo.png',
  './fotos/favicon-96x96.png',
  './fotos/apple-touch-icon.png',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@200;400;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Instalar el Service Worker
self.addEventListener('install', function(event) {
  console.log('🔧 Instalando Service Worker...');
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
  // Forzar activación inmediata
  self.skipWaiting();
});

// Interceptar solicitudes de red
self.addEventListener('fetch', function(event) {
  // Solo interceptar requests GET
  if (event.request.method !== 'GET') return;
  
  // Ignorar requests de Chrome DevTools
  if (event.request.url.startsWith('chrome-extension://')) return;
  
  // Ignorar requests de Firebase en tiempo real
  if (event.request.url.includes('firebaseio.com')) {
    return; // Dejar que Firebase maneje sus propias conexiones
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Si está en cache, devolverlo
        if (response) {
          console.log('📦 Sirviendo desde cache:', event.request.url);
          return response;
        }
        
        // Si no, ir a la red
        console.log('🌐 Solicitando desde red:', event.request.url);
        return fetch(event.request).then(
          function(response) {
            // Verificar que tenemos una respuesta válida
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Solo cachear recursos de nuestro dominio
            if (event.request.url.startsWith(self.location.origin)) {
              // Clonar la respuesta
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
          // Si falla la red y no está en cache, devolver página offline básica
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
      })
  );
});

// Actualizar el Service Worker
self.addEventListener('activate', function(event) {
  console.log('🔄 Activando Service Worker...');
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
      console.log('✅ Service Worker activado');
      return self.clients.claim();
    })
  );
});

// Manejar mensajes del cliente
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
