document.addEventListener("DOMContentLoaded", () => {
  const mobileToggle = document.getElementById("mobile-nav-toggle");
  const navList = document.getElementById("nav-list");

  if (mobileToggle && navList) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = navList.classList.toggle("open");
      mobileToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  document.querySelectorAll("[data-dropdown] > .nav-drop-toggle").forEach((button) => {
    button.addEventListener("click", (event) => {
      const dropdown = event.currentTarget.parentElement;
      if (dropdown) {
        dropdown.classList.toggle("open");
      }
    });
  });
});
