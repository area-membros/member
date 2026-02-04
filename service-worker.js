/*
Arquivo: service-worker.js
Local: /service-worker.js
Descrição: Cache para funcionamento offline (PWA)
*/

const CACHE_NAME = 'tribo-de-cristo-v1';

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/images/capa-davi.jpg',
  '/images/capa-golias.jpg',
  '/pdfs/segredos-de-davi.pdf',
  '/pdfs/davi-e-golias.pdf'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});