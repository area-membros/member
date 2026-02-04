const STORAGE_LAST = "membros:lastItemId";

function qs(id){ return document.getElementById(id); }

async function fetchCatalog() {
  const res = await fetch("/assets/data/content.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao carregar content.json");
  return res.json();
}

function norm(s){ return String(s || "").toLowerCase().trim(); }

function groupByCategory(items) {
  const map = new Map();
  for (const it of items) {
    const cat = it.category || "Geral";
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat).push(it);
  }
  return map;
}

function makePoster(item) {
  const poster = document.createElement("div");
  poster.className = "poster";

  const badge = document.createElement("div");
  badge.className = "badge-type";
  badge.textContent = (item.type || "").toUpperCase() || "ITEM";
  poster.appendChild(badge);

  if (item.cover) {
    const img = document.createElement("img");
    img.src = item.cover;
    img.alt = item.title || "Capa";
    img.loading = "lazy";
    poster.appendChild(img);
  } else {
    const fallback = document.createElement("div");
    fallback.className = "poster-fallback";
    const t = document.createElement("span");
    t.textContent = item.title || "Conteúdo";
    fallback.appendChild(t);
    poster.appendChild(fallback);
  }

  return poster;
}

function makeCard(item) {
  const card = document.createElement("article");
  card.className = "card";

  const poster = makePoster(item);

  const body = document.createElement("div");
  body.className = "card-body";

  const title = document.createElement("h3");
  title.className = "card-title";
  title.textContent = item.title || "Sem título";

  const desc = document.createElement("p");
  desc.className = "card-desc";
  desc.textContent = item.description || "";

  const actions = document.createElement("div");
  actions.className = "card-actions";

  const btnOpen = document.createElement("button");
  btnOpen.className = "btn primary";
  btnOpen.textContent = "Abrir";
  btnOpen.addEventListener("click", () => openModal(item));

  actions.appendChild(btnOpen);

  body.appendChild(title);
  body.appendChild(desc);
  body.appendChild(actions);

  card.appendChild(poster);
  card.appendChild(body);

  return card;
}

function renderRows(items) {
  const rows = qs("rows");
  rows.innerHTML = "";

  const grouped = groupByCategory(items);

  for (const [category, list] of grouped.entries()) {
    const block = document.createElement("section");
    block.className = "row-block";

    const head = document.createElement("div");
    head.className = "row-head";

    const left = document.createElement("div");
    const h = document.createElement("h2");
    h.className = "row-title";
    h.textContent = category;

    const sub = document.createElement("p");
    sub.className = "row-sub";
    sub.textContent = `${list.length} item(ns)`;

    left.appendChild(h);
    left.appendChild(sub);

    head.appendChild(left);

    const carousel = document.createElement("div");
    carousel.className = "carousel";
    list.forEach((it) => carousel.appendChild(makeCard(it)));

    block.appendChild(head);
    block.appendChild(carousel);

    rows.appendChild(block);
  }
}

function openModal(item) {
  const modal = qs("modal");
  const modalBackdrop = qs("modalBackdrop");
  const btnClose = qs("btnClose");

  const modalTitle = qs("modalTitle");
  const modalDesc = qs("modalDesc");
  const modalType = qs("modalType");
  const modalTag = qs("modalTag");

  const pdfBox = qs("pdfBox");
  const pdfFrame = qs("pdfFrame");
  const btnDownloadPdf = qs("btnDownloadPdf");
  const btnOpenPdf = qs("btnOpenPdf");

  const videoBox = qs("videoBox");
  const videoPlayer = qs("videoPlayer");
  const btnOpenVideo = qs("btnOpenVideo");

  // base
  modalTitle.textContent = item.title || "Conteúdo";
  modalDesc.textContent = item.description || "";
  modalType.textContent = (item.type || "").toUpperCase() || "ITEM";

  if (item.tag) {
    modalTag.hidden = false;
    modalTag.textContent = item.tag;
  } else {
    modalTag.hidden = true;
  }

  // reset
  pdfBox.hidden = true;
  videoBox.hidden = true;
  pdfFrame.src = "about:blank";
  try { videoPlayer.pause(); } catch(e){}
  videoPlayer.removeAttribute("src");

  // show
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

  // persist last opened
  if (item.id) localStorage.setItem(STORAGE_LAST, item.id);

  // open
  modal.hidden = false;

  const close = () => {
    modal.hidden = true;
    pdfFrame.src = "about:blank";
    try { videoPlayer.pause(); } catch(e){}
    videoPlayer.removeAttribute("src");
    modalBackdrop.removeEventListener("click", close);
    btnClose.removeEventListener("click", close);
    document.removeEventListener("keydown", onKey);
  };

  const onKey = (ev) => {
    if (ev.key === "Escape") close();
  };

  modalBackdrop.addEventListener("click", close);
  btnClose.addEventListener("click", close);
  document.addEventListener("keydown", onKey);
}

function wireContinue(allItems) {
  const btn = qs("btnContinue");
  const lastId = localStorage.getItem(STORAGE_LAST);

  if (!lastId) {
    btn.disabled = true;
    btn.textContent = "Continuar";
    return;
  }

  const found = allItems.find((x) => x.id === lastId);
  if (!found) {
    btn.disabled = true;
    return;
  }

  btn.disabled = false;
  btn.textContent = `Continuar: ${found.title}`;

  btn.addEventListener("click", () => openModal(found), { once: true });
}

(async () => {
  const search = qs("search");
  const btnRefresh = qs("btnRefresh");

  let allItems = [];

  const load = async () => {
    const data = await fetchCatalog();
    allItems = Array.isArray(data.items) ? data.items : [];
    renderRows(allItems);
    wireContinue(allItems);
  };

  const applySearch = () => {
    const q = norm(search.value);
    if (!q) return renderRows(allItems);

    const filtered = allItems.filter((it) =>
      norm(it.title).includes(q) ||
      norm(it.description).includes(q) ||
      norm(it.tag).includes(q) ||
      norm(it.category).includes(q)
    );

    renderRows(filtered);
  };

  search.addEventListener("input", applySearch);
  btnRefresh.addEventListener("click", load);

  await load();
})();
