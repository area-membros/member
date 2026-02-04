const CACHE_NAME = "membros-v2";

// “Shell” do app (o que precisa pra interface abrir)
const SHELL = [
  "/",
  "/index.html",
  "/app/",
  "/app/index.html",
  "/manifest.webmanifest",
  "/service-worker.js",
  "/assets/css/styles.css",
  "/assets/js/pwa.js",
  "/assets/js/app.js",
  "/assets/data/content.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k)))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== "GET") return;

  // Cache-first pro shell e assets
  if (SHELL.includes(url.pathname) || url.pathname.startsWith("/assets/")) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req))
    );
    return;
  }

  // Network-first pros deliverables (PDF/vídeo)
  if (url.pathname.startsWith("/deliverables/")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
  }
});
