const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const filterChips = document.querySelectorAll(".filter-chip");
const cards = document.querySelectorAll(".profile-card");
const emptyState = document.getElementById("emptyState");

let activeOficio = "todos";

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
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
