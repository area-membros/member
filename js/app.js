/*
Arquivo: app.js
Local: /js/app.js
Descrição: Registro do Service Worker e lógica do PWA
*/

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}