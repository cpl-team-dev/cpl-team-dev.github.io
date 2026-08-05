document.addEventListener("DOMContentLoaded", () => {
  const stack = document.getElementById("post-stack");
  const search = document.getElementById("post-search");
  const category = document.getElementById("post-category");

  if (!stack || !search || !category) return;

  const cards = Array.from(stack.querySelectorAll(".post-card"));

  function applyFilters() {
    const q = search.value.trim().toLowerCase();
    const c = category.value;

    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      const cardCats = (card.getAttribute("data-categories") || "").toLowerCase();

      const queryOk = !q || text.includes(q);
      const catOk = c === "all" || cardCats.includes(c.toLowerCase());

      card.style.display = queryOk && catOk ? "block" : "none";
    });
  }

  search.addEventListener("input", applyFilters);
  category.addEventListener("change", applyFilters);
});
