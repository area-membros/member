/*
Arquivo: service-worker.js
Local: /service-worker.js
Descrição: Offline robusto (app shell pré-cache + PDFs sob demanda)
*/

const CACHE_VERSION = 'v4';
const APP_SHELL_CACHE = `tribo-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `tribo-runtime-${CACHE_VERSION}`;

// Só o essencial para o app abrir offline
const APP_SHELL = [
  '/',                 // importante para navegação
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/manifest.json',
  '/images/icons/icon-192.png',
  '/images/icons/icon-512.png',

  // Imagens dos cards (opcional, mas ajuda muito)
  '/images/capa-davi.jpg',
  '/images/capa-golias.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (![APP_SHELL_CACHE, RUNTIME_CACHE].includes(key)) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1) Navegação (abrir o app): devolve index.html do cache quando offline
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 2) Só trata arquivos do seu próprio domínio
  if (url.origin !== location.origin) return;

  // 3) PDFs: cache sob demanda (abre 1x online -> depois abre offline)
  if (url.pathname.endsWith('.pdf')) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;

        try {
          const fresh = await fetch(req);
          cache.put(req, fresh.clone());
          return fresh;
        } catch (e) {
          // Se nunca abriu online, não existe no cache
          return cached || Response.error();
        }
      })
    );
    return;
  }

  // 4) Imagens/CSS/JS: cache-first (rápido e offline-friendly)
  event.respondWith(
    caches.match(req).then((cached) => {
      return (
        cached ||
        fetch(req).then((fresh) => {
          return caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(req, fresh.clone());
            return fresh;
          });
        }).catch(() => cached)
      );
    })
  );
});
