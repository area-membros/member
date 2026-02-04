let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById("btnInstall");
  if (btn) btn.hidden = false;
});

window.addEventListener("appinstalled", () => {
  deferredPrompt = null;
  const btn = document.getElementById("btnInstall");
  if (btn) btn.hidden = true;
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
    } catch (err) {}
  });
}
