(async () => {
  const user = await window.__AUTH__.initAuth();

  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) btnLogout.hidden = !user;

  window.__AUTH__.wireAuthButtons({
    onLogin: () => {
      if (btnLogout) btnLogout.hidden = false;
    },
    onLogout: () => {
      if (btnLogout) btnLogout.hidden = true;
    }
  });
})();