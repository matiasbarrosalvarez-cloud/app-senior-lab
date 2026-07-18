const STORAGE_KEY = "oficios_perfiles_v1";

const ICONS = {
  lena: "🪓",
  gasfiteria: "🔧",
  electricidad: "⚡",
};

const OFICIO_LABEL = {
  lena: "Leña",
  gasfiteria: "Gasfitería",
  electricidad: "Electricidad",
};

const BADGE_CLASS = {
  verificado: "verified",
  tramite: "pending",
  sin_certificacion: "none",
};

const BADGE_TEXT = {
  verificado: "✔ Verificado",
  tramite: "⏳ En trámite",
  sin_certificacion: "— Sin certificación",
};

const CERT_INFO = {
  verificado: "Certificación validada mediante ChileValora, el sistema nacional de certificación de competencias laborales.",
  tramite: "El profesional inició su proceso de certificación ante ChileValora y está pendiente de validación final.",
  sin_certificacion: "Este profesional aún no registra una certificación formal en la plataforma.",
};

const CERTIFIERS = {
  achs: { name: "ACHS", logo: "assets/certificadoras/achs.png" },
  bureau_veritas: { name: "Bureau Veritas", logo: "assets/certificadoras/bureau-veritas.png" },
  sec: { name: "SEC", logo: "assets/certificadoras/sec.png" },
};

const seedProfiles = [
  {
    id: "seed-1",
    nombre: "Juan Pérez",
    edad: 45,
    oficio: "lena",
    oficioLabel: "Leñero",
    icon: "🪓",
    experiencia: 12,
    zona: "Temuco, Araucanía",
    certificacion: "verificado",
    certificadora: "achs",
  },
  {
    id: "seed-2",
    nombre: "María González",
    edad: 38,
    oficio: "gasfiteria",
    oficioLabel: "Gasfitera",
    icon: "🔧",
    foto: "assets/fotos/gasfiteria-antes-despues.jpg",
    fotoTrabajando: "assets/fotos/gasfiter-trabajando.jpg",
    experiencia: 8,
    zona: "Providencia, Santiago",
    certificacion: "tramite",
    certificadora: "bureau_veritas",
  },
  {
    id: "seed-3",
    nombre: "Carlos Muñoz",
    edad: 52,
    oficio: "electricidad",
    oficioLabel: "Electricista",
    icon: "⚡",
    foto: "assets/fotos/electricidad-antes-despues.jpg",
    fotoTrabajando: "assets/fotos/electricista-trabajando.jpg",
    experiencia: 20,
    zona: "Valparaíso",
    certificacion: "verificado",
    certificadora: "sec",
    destacado: true,
  },
  {
    id: "seed-4",
    nombre: "Rosa Fuentes",
    edad: 41,
    oficio: "lena",
    oficioLabel: "Leñera",
    icon: "🪵",
    experiencia: 6,
    zona: "Los Ángeles, Biobío",
    certificacion: "tramite",
    destacado: true,
  },
];

function loadProfiles() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      /* datos corruptos, se reinicia con los de ejemplo */
    }
  }
  return seedProfiles.slice();
}

function saveProfiles(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

let profiles = loadProfiles();
saveProfiles(profiles);

let activeOficio = "todos";

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const filterChips = document.querySelectorAll(".filter-chip");
const profileList = document.getElementById("profileList");
const emptyState = document.getElementById("emptyState");

const addProfileBtn = document.getElementById("addProfileBtn");
const formModalOverlay = document.getElementById("formModalOverlay");
const formModalClose = document.getElementById("formModalClose");
const cancelFormBtn = document.getElementById("cancelFormBtn");
const profileForm = document.getElementById("profileForm");

const detailModalOverlay = document.getElementById("detailModalOverlay");
const detailModalClose = document.getElementById("detailModalClose");
const detailContent = document.getElementById("detailContent");

function makeDetailItem(label, value) {
  const li = document.createElement("li");
  const strong = document.createElement("strong");
  strong.textContent = `${label}: `;
  li.append(strong, document.createTextNode(value));
  return li;
}

function createBadge(certificacion) {
  const badge = document.createElement("span");
  badge.className = `badge ${BADGE_CLASS[certificacion]}`;
  badge.tabIndex = 0;
  badge.setAttribute("role", "button");
  badge.setAttribute("aria-label", `${BADGE_TEXT[certificacion]}. Más información`);
  badge.appendChild(document.createTextNode(BADGE_TEXT[certificacion]));

  const tooltip = document.createElement("span");
  tooltip.className = "badge-tooltip";
  tooltip.textContent = CERT_INFO[certificacion];
  badge.appendChild(tooltip);

  return badge;
}

function toggleBadgeTooltip(badge) {
  const isOpen = badge.classList.contains("show-tooltip");
  document.querySelectorAll(".badge.show-tooltip").forEach((b) => b.classList.remove("show-tooltip"));
  if (!isOpen) badge.classList.add("show-tooltip");
}

function renderProfileBody(profile) {
  const frag = document.createDocumentFragment();

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  if (profile.foto) {
    const img = document.createElement("img");
    img.className = "avatar-photo";
    img.src = profile.foto;
    img.alt = `Trabajo realizado por ${profile.nombre} — antes y después`;
    avatar.appendChild(img);
  } else {
    avatar.textContent = profile.icon || ICONS[profile.oficio] || "🛠️";
  }

  const info = document.createElement("div");
  info.className = "info";

  const header = document.createElement("div");
  header.className = "info-header";

  const h2 = document.createElement("h2");
  h2.textContent = profile.nombre;

  const badge = createBadge(profile.certificacion);

  header.append(h2, badge);

  const oficioP = document.createElement("p");
  oficioP.className = "oficio";
  oficioP.textContent = profile.oficioLabel || OFICIO_LABEL[profile.oficio];

  const list = document.createElement("ul");
  list.className = "details";
  list.append(
    makeDetailItem("Edad", `${profile.edad} años`),
    makeDetailItem("Experiencia", `${profile.experiencia} años`),
    makeDetailItem("Zona", profile.zona)
  );

  info.append(header, oficioP, list);

  const certifier = CERTIFIERS[profile.certificadora];
  if (certifier) {
    const certifierDiv = document.createElement("div");
    certifierDiv.className = "certifier";

    const label = document.createElement("span");
    label.className = "certifier-label";
    label.textContent = "Certificado por";

    const logo = document.createElement("img");
    logo.className = "certifier-logo";
    logo.src = certifier.logo;
    logo.alt = certifier.name;

    certifierDiv.append(label, logo);
    info.append(certifierDiv);
  }

  frag.append(avatar, info);

  if (profile.destacado) {
    const ribbon = document.createElement("span");
    ribbon.className = "gold-badge corner-ribbon";
    ribbon.textContent = "★ Destacado";
    frag.append(ribbon);
  }

  return frag;
}

function createCardElement(profile) {
  const card = document.createElement("article");
  card.className = profile.destacado ? "profile-card featured" : "profile-card";
  card.dataset.oficio = profile.oficio;
  card.dataset.id = profile.id;
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-haspopup", "dialog");
  card.append(renderProfileBody(profile));
  return card;
}

function renderProfiles() {
  profileList.innerHTML = "";
  profiles.forEach((profile) => profileList.appendChild(createCardElement(profile)));
  applyFilters();
}

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const cards = document.querySelectorAll(".profile-card");
  let visibleCount = 0;

  cards.forEach((card) => {
    const matchesOficio = activeOficio === "todos" || card.dataset.oficio === activeOficio;
    const matchesQuery = query === "" || card.textContent.toLowerCase().includes(query);
    const isVisible = matchesOficio && matchesQuery;

    card.hidden = !isVisible;
    if (isVisible) visibleCount++;
  });

  emptyState.hidden = visibleCount > 0;
}

filterChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    filterChips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    activeOficio = chip.dataset.oficio;
    applyFilters();
  });
});

searchBtn.addEventListener("click", applyFilters);
searchInput.addEventListener("input", applyFilters);

function updateBodyScroll() {
  const anyOpen = !formModalOverlay.hidden || !detailModalOverlay.hidden;
  document.body.classList.toggle("modal-open", anyOpen);
}

function openFormModal() {
  profileForm.reset();
  formModalOverlay.hidden = false;
  updateBodyScroll();
  document.getElementById("fieldNombre").focus();
}

function closeFormModal() {
  formModalOverlay.hidden = true;
  updateBodyScroll();
}

addProfileBtn.addEventListener("click", openFormModal);
cancelFormBtn.addEventListener("click", closeFormModal);
formModalClose.addEventListener("click", closeFormModal);
formModalOverlay.addEventListener("click", (e) => {
  if (e.target === formModalOverlay) closeFormModal();
});

profileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(profileForm);
  const oficio = data.get("oficio");

  const newProfile = {
    id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    nombre: data.get("nombre").trim(),
    edad: Number(data.get("edad")),
    oficio,
    oficioLabel: OFICIO_LABEL[oficio],
    experiencia: Number(data.get("experiencia")),
    zona: data.get("zona").trim(),
    certificacion: data.get("certificacion"),
  };

  profiles.unshift(newProfile);
  saveProfiles(profiles);

  activeOficio = "todos";
  filterChips.forEach((c) => c.classList.toggle("active", c.dataset.oficio === "todos"));
  searchInput.value = "";

  renderProfiles();
  closeFormModal();
});

function buildPhotoFigure(src, alt, caption) {
  const figure = document.createElement("figure");
  figure.className = "detail-photo";

  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;

  const figcaption = document.createElement("figcaption");
  figcaption.textContent = caption;

  figure.append(img, figcaption);
  return figure;
}

function openDetailModal(profile) {
  detailContent.innerHTML = "";
  detailContent.className = "";

  const summary = document.createElement("div");
  summary.className = "detail-body";
  summary.append(renderProfileBody(profile));
  detailContent.append(summary);

  if (profile.fotoTrabajando) {
    detailContent.append(
      buildPhotoFigure(profile.fotoTrabajando, `${profile.nombre} trabajando en terreno`, "Trabajando en terreno")
    );
  }

  if (profile.foto) {
    detailContent.append(
      buildPhotoFigure(profile.foto, `Trabajo realizado por ${profile.nombre} — antes y después`, "Antes y después de un trabajo realizado")
    );
  }

  detailModalOverlay.hidden = false;
  updateBodyScroll();
  detailModalClose.focus();
}

function closeDetailModal() {
  detailModalOverlay.hidden = true;
  updateBodyScroll();
}

detailModalClose.addEventListener("click", closeDetailModal);
detailModalOverlay.addEventListener("click", (e) => {
  if (e.target === detailModalOverlay) closeDetailModal();
});

function handleCardActivate(target) {
  const card = target.closest(".profile-card");
  if (!card) return;
  const profile = profiles.find((p) => p.id === card.dataset.id);
  if (profile) openDetailModal(profile);
}

profileList.addEventListener("click", (e) => handleCardActivate(e.target));
profileList.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault();
  handleCardActivate(e.target);
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!formModalOverlay.hidden) closeFormModal();
  if (!detailModalOverlay.hidden) closeDetailModal();
});

document.addEventListener(
  "click",
  (e) => {
    const badge = e.target.closest(".badge");
    if (badge) {
      e.stopPropagation();
      toggleBadgeTooltip(badge);
      return;
    }
    document.querySelectorAll(".badge.show-tooltip").forEach((b) => b.classList.remove("show-tooltip"));
  },
  true
);

document.addEventListener(
  "keydown",
  (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const badge = e.target.closest(".badge");
    if (!badge) return;
    e.preventDefault();
    e.stopPropagation();
    toggleBadgeTooltip(badge);
  },
  true
);

renderProfiles();
