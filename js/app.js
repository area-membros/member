/*
Arquivo: app.js
Local: /js/app.js
Descrição: Registro do SW + popup de instalação PWA controlado por você
*/
console.log('[PWA] app.js carregou');

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('[PWA] beforeinstallprompt DISPAROU ✅');
});
window.addEventListener('appinstalled', () => {
  console.log('[PWA] appinstalled ✅');
});


//aqui termina

const modal = document.getElementById('installModal');
const btnInstall = document.getElementById('installBtn');
const btnClose = document.getElementById('installClose');
const iosHint = document.getElementById('iosHint');

let deferredPrompt = null;

// Detecta se já está instalado (modo standalone)
function isInStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// Detecta iOS Safari (não suporta beforeinstallprompt)
function isIOS() {
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
}

// Abre/fecha modal
function openModal() {
  if (!modal) return;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  // Se quiser “não mostrar mais hoje”, descomente:
  // localStorage.setItem('install_modal_dismissed', String(Date.now()));
}

// Registrar Service Worker (offline)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}

// Guardar o evento do navegador que permite disparar a instalação
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (btnInstall) btnInstall.disabled = false;
});

// Se o app foi instalado, some com o modal
window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  closeModal();
});

// Controle do “mostrar sempre”
window.addEventListener('load', () => {
  // Se já está instalado, não mostra
  if (isInStandaloneMode()) return;

  // Se quiser respeitar “fechou e não mostra mais hoje”, use isso:
  // const dismissedAt = Number(localStorage.getItem('install_modal_dismissed') || 0);
  // const oneDay = 24 * 60 * 60 * 1000;
  // if (dismissedAt && (Date.now() - dismissedAt) < oneDay) return;

  openModal();

  // iOS: não tem prompt automático → mostra instrução
  if (isIOS()) {
    if (iosHint) iosHint.hidden = false;
    if (btnInstall) btnInstall.disabled = true;
  }
});

// Botão fechar
if (btnClose) {
  btnClose.addEventListener('click', closeModal);
}

// Botão instalar (precisa ser clique do usuário)
if (btnInstall) {
  btnInstall.addEventListener('click', async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;

    // Se aceitou, o evento appinstalled cuidará de fechar
    // Se recusou, você pode decidir se fecha ou mantém
    if (result && result.outcome === 'dismissed') {
      // Mantém aberto ou fecha — você escolhe:
      // closeModal();
    }

    deferredPrompt = null;
  });
}

