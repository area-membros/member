function el(tag, attrs = {}, children = []) {
  const n = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") n.className = v;
    else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  });
  children.forEach((c) => n.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
  return n;
}

async function fetchContent() {
  const res = await fetch("/assets/data/content.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao carregar conteúdo");
  return res.json();
}

function renderList(items) {
  const grid = document.getElementById("contentGrid");
  grid.innerHTML = "";

  items.forEach((item) => {
    const title = el("h3", { class: "item-title" }, [item.title]);
    const desc = el("p", { class: "item-desc" }, [item.description || ""]);

    const meta = el("div", { class: "item-meta" }, [
      el("span", { class: "pill" }, [String(item.type || "").toUpperCase()]),
      item.tag ? el("span", { class: "pill" }, [item.tag]) : null,
    ].filter(Boolean));

    const btnOpen = el("button", {
      class: "btn primary",
      onclick: () => openViewer(item)
    }, ["Abrir"]);

    const btn2 = item.type === "pdf"
      ? el("a", { class: "btn", href: item.url, download: "" }, ["Baixar"])
      : el("a", { class: "btn", href: item.url, target: "_blank", rel: "noopener" }, ["Abrir em aba"]);

    const actions = el("div", { class: "actions" }, [btnOpen, btn2]);

    grid.appendChild(el("article", { class: "item" }, [title, desc, meta, actions]));
  });
}

function openViewer(item) {
  const viewerCard = document.getElementById("viewerCard");
  const viewerTitle = document.getElementById("viewerTitle");

  const pdfBox = document.getElementById("pdfBox");
  const pdfFrame = document.getElementById("pdfFrame");
  const btnDownloadPdf = document.getElementById("btnDownloadPdf");
  const btnOpenPdf = document.getElementById("btnOpenPdf");

  const videoBox = document.getElementById("videoBox");
  const videoPlayer = document.getElementById("videoPlayer");
  const btnOpenVideo = document.getElementById("btnOpenVideo");

  viewerTitle.textContent = item.title;
  viewerCard.hidden = false;

  // reset
  pdfBox.hidden = true;
  videoBox.hidden = true;
  pdfFrame.src = "about:blank";
  videoPlayer.removeAttribute("src");

  if (item.type === "pdf") {
    pdfBox.hidden = false;
    pdfFrame.src = item.url;
    btnDownloadPdf.href = item.url;
    btnOpenPdf.href = item.url;
  } else if (item.type === "video") {
    videoBox.hidden = false;
    videoPlayer.src = item.url;
    btnOpenVideo.href = item.url;
  }

  viewerCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeViewer() {
  const viewerCard = document.getElementById("viewerCard");
  const pdfFrame = document.getElementById("pdfFrame");
  const videoPlayer = document.getElementById("videoPlayer");

  pdfFrame.src = "about:blank";
  videoPlayer.pause?.();
  videoPlayer.removeAttribute("src");
  viewerCard.hidden = true;
}

(async () => {
  const btnClose = document.getElementById("btnCloseViewer");
  btnClose.addEventListener("click", closeViewer);

  const btnRefresh = document.getElementById("btnRefresh");
  const search = document.getElementById("search");

  let allItems = [];

  async function load() {
    const data = await fetchContent();
    allItems = data.items || [];
    renderList(allItems);
  }

  function applySearch() {
    const q = (search.value || "").trim().toLowerCase();
    if (!q) return renderList(allItems);

    const filtered = allItems.filter((i) =>
      (i.title || "").toLowerCase().includes(q) ||
      (i.description || "").toLowerCase().includes(q) ||
      (i.tag || "").toLowerCase().includes(q)
    );
    renderList(filtered);
  }

  btnRefresh.addEventListener("click", load);
  search.addEventListener("input", applySearch);

  await load();
})();
