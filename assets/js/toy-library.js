document.addEventListener("DOMContentLoaded", () => {
  const listViewBtn = document.getElementById("toy-view-list");
  const gridViewBtn = document.getElementById("toy-view-grid");
  const sortSelect = document.getElementById("toy-sort");
  const searchInput = document.getElementById("toy-search");
  const chips = document.getElementById("toy-category-chips");
  const filterToggle = document.getElementById("toy-filter-toggle");
  const results = document.getElementById("toy-results");
  const count = document.getElementById("toy-count");

  if (!listViewBtn || !gridViewBtn || !sortSelect || !searchInput || !chips || !filterToggle || !results || !count) {
    return;
  }

  const allItems = [
    { name: "1 2 3 Jigsaw + Book", category: "Puzzles", img: "../legacy/src/imports/Screenshot_2026-07-17_at_16.28.56.png" },
    { name: "100 Words Book", category: "Toddler", img: "../legacy/src/imports/Screenshot_2026-07-17_at_16.29.13.png" },
    { name: "100 Words Electronic Book", category: "Toddler", img: null },
    { name: "Alphabet Puzzle", category: "Puzzles", img: "../legacy/src/imports/Screenshot_2026-07-17_at_16.29.23.png" },
    { name: "Baby Bouncer", category: "Baby", img: "../legacy/src/imports/Screenshot_2026-07-17_at_16.29.32.png" },
    { name: "Baby Gym", category: "Baby", img: "../legacy/src/imports/Screenshot_2026-07-17_at_16.29.41.png" },
    { name: "Ball Pool", category: "Outdoor", img: "../legacy/src/imports/Screenshot_2026-07-17_at_16.29.49.png" },
    { name: "Bead Maze", category: "Toddler", img: "../legacy/src/imports/Screenshot_2026-07-17_at_16.29.57.png" },
    { name: "Building Blocks (Large)", category: "Construction", img: "../legacy/src/imports/Screenshot_2026-07-17_at_16.30.05.png" },
    { name: "Connect Four", category: "Games", img: "../legacy/src/imports/Screenshot_2026-07-17_at_16.30.13.png" },
    { name: "Doctor's Kit", category: "Role Play", img: "../legacy/src/imports/Screenshot_2026-07-17_at_16.30.21.png" },
    { name: "Drawing Board (Magnetic)", category: "Creative Play", img: "../legacy/src/imports/Screenshot_2026-07-17_at_16.30.29.png" }
  ];

  const categories = ["All", ...new Set(allItems.map((item) => item.category))];
  let currentView = "list";
  let activeCategory = "All";

  chips.innerHTML = categories
    .map((category) => `<button class="chip ${category === "All" ? "active" : ""}" data-category="${category}">${category}</button>`)
    .join("");

  function itemMarkup(item) {
    const image = item.img
      ? `<img src="${item.img}" alt="${item.name}">`
      : `<div class="placeholder">🖼</div>`;

    if (currentView === "grid") {
      return `
        <article class="toy-grid-card">
          <div class="img-wrap">${image}</div>
          <div class="copy">
            <p class="category">${item.category}</p>
            <h3>${item.name}</h3>
            <a class="btn" href="#" style="font-size:18px;padding:6px 14px">Read more</a>
          </div>
        </article>
      `;
    }

    return `
      <article class="toy-item">
        <div class="img-wrap">${image}</div>
        <div class="copy">
          <p class="category">${item.category}</p>
          <h3>${item.name}</h3>
          <a class="btn" href="#" style="font-size:20px;padding:8px 16px">Read more</a>
        </div>
      </article>
    `;
  }

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const sort = sortSelect.value;

    let filtered = allItems.filter((item) => {
      const categoryOk = activeCategory === "All" || item.category === activeCategory;
      const queryOk = !query || item.name.toLowerCase().includes(query);
      return categoryOk && queryOk;
    });

    if (sort === "az") filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "za") filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));
    if (sort === "cat") filtered = [...filtered].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

    count.textContent = `${filtered.length} item${filtered.length === 1 ? "" : "s"}`;

    if (filtered.length === 0) {
      results.innerHTML = `<article class="card split-copy"><p>No toys found.</p></article>`;
      return;
    }

    const wrapperClass = currentView === "grid" ? "toy-grid" : "toy-list";
    results.innerHTML = `<div class="${wrapperClass}">${filtered.map(itemMarkup).join("")}</div>`;
  }

  chips.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      activeCategory = chip.getAttribute("data-category") || "All";
      chips.querySelectorAll(".chip").forEach((button) => button.classList.remove("active"));
      chip.classList.add("active");
      render();
    });
  });

  listViewBtn.addEventListener("click", () => {
    currentView = "list";
    listViewBtn.classList.add("active");
    gridViewBtn.classList.remove("active");
    render();
  });

  gridViewBtn.addEventListener("click", () => {
    currentView = "grid";
    gridViewBtn.classList.add("active");
    listViewBtn.classList.remove("active");
    render();
  });

  filterToggle.addEventListener("click", () => {
    chips.style.display = chips.style.display === "none" ? "flex" : "none";
  });

  sortSelect.addEventListener("change", render);
  searchInput.addEventListener("input", render);

  render();
});
