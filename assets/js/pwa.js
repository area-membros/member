let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById("btnInstall");
  const hint = document.getElementById("installHint");
  if (btn) btn.hidden = false;
  if (hint) hint.textContent = "Dica: toque em “Instalar App” para adicionar na tela inicial.";
});

window.addEventListener("appinstalled", () => {
  deferredPrompt = null;
  const btn = document.getElementById("btnInstall");
  const hint = document.getElementById("installHint");
  if (btn) btn.hidden = true;
  if (hint) hint.textContent = "App instalado ✅";
});

document.addEventListener("click", async (e) => {
  const btn = e.target?.closest?.("#btnInstall");
  if (!btn || !deferredPrompt) return;

  btn.disabled = true;
  try {
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
  } finally {
    btn.disabled = false;
    deferredPrompt = null;
    btn.hidden = true;
  }
});

// service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("/service-worker.js");
    } catch (err) {
      // silencioso pra não travar UX
    }
  });
}