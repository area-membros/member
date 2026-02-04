/*
Arquivo: service-worker.js
Local: /service-worker.js
Descrição: Cache offline + limpeza de versões antigas (PWA)
*/

const CACHE_NAME = 'tribo-de-cristo-v3';

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/manifest.json',

  // Imagens dos cards
  '/images/capa-davi.jpg',
  '/images/capa-golias.jpg',

  // PDFs
  '/pdfs/segredos-de-davi.pdf',
  '/pdfs/davi-e-golias.pdf',

  // Ícones do PWA
  '/images/icons/icon-192.png',
  '/images/icons/icon-512.png'
];

// INSTALAÇÃO — salva arquivos no cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ATIVAÇÃO — limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH — usa cache primeiro, depois rede
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
