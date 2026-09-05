document.addEventListener("DOMContentLoaded", () => {
  const scrollToHash = (hash, behavior = "smooth") => {
    if (!hash || hash === "#") return;
    const target = document.querySelector(hash);
    if (target) {
      target.scrollIntoView({ behavior, block: "start" });
    }
  };

  if (window.location.hash) {
    scrollToHash(window.location.hash, "smooth");
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      history.replaceState(null, "", href);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const stickyNav = document.querySelector("[data-services-sticky-nav]");
  const stickyLinks = Array.from(
    document.querySelectorAll("[data-service-nav-link]")
  );
  const chipLinks = Array.from(
    document.querySelectorAll(".services-jump-chips a[href^='#']")
  );

  if (!stickyNav || !stickyLinks.length) return;

  const sectionIds = stickyLinks
    .map((link) => link.getAttribute("href") || "")
    .filter((href) => href.startsWith("#"))
    .map((href) => href.slice(1));

  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const setActive = (id) => {
    const href = `#${id}`;

    stickyLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === href;
      link.classList.toggle("is-active", isActive);
      link.setAttribute("aria-current", isActive ? "true" : "false");
    });

    chipLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === href;
      link.setAttribute("aria-current", isActive ? "true" : "false");
    });
  };

  const toggleStickyVisibility = () => {
    const shouldShow = window.scrollY > 320;
    stickyNav.hidden = !shouldShow;
    stickyNav.classList.toggle("is-visible", shouldShow);
  };

  window.addEventListener("scroll", toggleStickyVisibility, { passive: true });
  toggleStickyVisibility();

  if (sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: [0.25, 0.45, 0.7] }
    );

    sections.forEach((section) => observer.observe(section));
  }

  if (window.location.hash) {
    const currentId = window.location.hash.slice(1);
    if (sectionIds.includes(currentId)) setActive(currentId);
  } else if (sectionIds[0]) {
    setActive(sectionIds[0]);
  }
});
