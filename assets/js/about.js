document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".faq-item .faq-q").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      if (!item) return;
      item.classList.toggle("open");
      const marker = button.querySelector("span");
      if (marker) {
        marker.textContent = item.classList.contains("open") ? "▾" : "▸";
      }
    });
  });
});
