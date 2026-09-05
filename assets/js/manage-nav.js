(function () {
  const STORAGE_KEY = "manage-sidebar-collapsed";
  const sidebar = document.getElementById("manage-sidebar");
  const toggle = document.getElementById("sidebar-toggle");
  if (!sidebar || !toggle) return;

  const apply = (collapsed) => {
    sidebar.classList.toggle("is-collapsed", collapsed);
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.setAttribute("aria-label", collapsed ? "Expand navigation" : "Collapse navigation");
    toggle.title = toggle.getAttribute("aria-label");
  };

  let collapsed = sidebar.classList.contains("is-collapsed");
  apply(collapsed);

  toggle.addEventListener("click", () => {
    collapsed = !collapsed;
    apply(collapsed);
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch (error) {
      /* localStorage unavailable — collapse state just won't persist */
    }
  });
})();
