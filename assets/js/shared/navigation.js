document.addEventListener("DOMContentLoaded", () => {
  const mobileToggle = document.getElementById("mobile-nav-toggle");
  const navList = document.getElementById("nav-list");
  const mobileNavQuery = window.matchMedia("(max-width: 1100px)");

  if (mobileToggle && navList) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = navList.classList.toggle("open");
      mobileToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  document.querySelectorAll("[data-dropdown] .nav-drop-toggle").forEach((button) => {
    button.addEventListener("click", (event) => {
      if (mobileNavQuery.matches) {
        return;
      }

      const dropdown = event.currentTarget.closest("[data-dropdown]");
      if (dropdown) {
        dropdown.classList.toggle("open");
      }
    });
  });

  const resetMobileMenu = (event) => {
    if (!event.matches && navList && mobileToggle) {
      navList.classList.remove("open");
      mobileToggle.setAttribute("aria-expanded", "false");
    }
  };

  if (typeof mobileNavQuery.addEventListener === "function") {
    mobileNavQuery.addEventListener("change", resetMobileMenu);
  } else if (typeof mobileNavQuery.addListener === "function") {
    mobileNavQuery.addListener(resetMobileMenu);
  }
});
