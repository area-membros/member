function ensureIdentityReady() {
  return new Promise((resolve) => {
    if (window.netlifyIdentity) return resolve();
    // espera o script carregar
    const t = setInterval(() => {
      if (window.netlifyIdentity) {
        clearInterval(t);
        resolve();
      }
    }, 50);
  });
}

async function initAuth() {
  await ensureIdentityReady();

  window.netlifyIdentity.init();

  const user = window.netlifyIdentity.currentUser();
  return user;
}

function requireLoginOnAppPage() {
  const isApp = location.pathname.startsWith("/app");
  if (!isApp) return;

  const user = window.netlifyIdentity?.currentUser?.();
  if (!user) {
    // manda pra home
    location.replace("/?from=app");
  }
}

function wireAuthButtons({ onLogin, onLogout } = {}) {
  const btnLogin = document.getElementById("btnLogin");
  const btnLogout = document.getElementById("btnLogout");

  if (btnLogin) {
    btnLogin.addEventListener("click", () => {
      window.netlifyIdentity.open("login");
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      window.netlifyIdentity.logout();
    });
  }

  window.netlifyIdentity.on("login", (user) => {
    window.netlifyIdentity.close();
    if (onLogin) onLogin(user);

    // se estiver na home, entra no app
    if (!location.pathname.startsWith("/app")) {
      location.href = "/app/";
    }
  });

  window.netlifyIdentity.on("logout", () => {
    if (onLogout) onLogout();
    location.href = "/";
  });
}

// export “global”
window.__AUTH__ = {
  initAuth,
  requireLoginOnAppPage,
  wireAuthButtons
};