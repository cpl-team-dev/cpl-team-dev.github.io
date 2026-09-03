document.addEventListener("DOMContentLoaded", () => {
  const mobileToggle = document.getElementById("mobile-nav-toggle");
  const navList = document.getElementById("nav-list");
  const mobileNavQuery = window.matchMedia("(max-width: 1100px)");

  const icon = (name) => {
    const paths = {
      close: '<path d="m6 6 12 12M18 6 6 18"/>',
      arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
      chevron: '<path d="m6 9 6 6 6-6"/>',
      blocks: '<rect x="4" y="11" width="7" height="7" rx="1"/><rect x="13" y="11" width="7" height="7" rx="1"/><rect x="8.5" y="4" width="7" height="5" rx="1"/>',
      toy: '<path d="M4 15.5 8.5 11l2.5 2.5L15.5 9l4.5 4.5V20H4Z"/><circle cx="8" cy="7" r="2.5"/><circle cx="17" cy="6.5" r="2.5"/>',
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
  };

  const createMobileMenu = () => {
    if (!mobileToggle || !navList) return null;

    const backdrop = document.createElement("div");
    backdrop.className = "mobile-menu-backdrop";
    backdrop.hidden = true;
    const panel = document.createElement("aside");
    panel.className = "mobile-menu-panel";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-label", "Main menu");

    const header = document.createElement("div");
    header.className = "mobile-menu-header";
    const brand = document.querySelector(".brand");
    if (brand) header.append(brand.cloneNode(true));
    const closeButton = document.createElement("button");
    closeButton.className = "mobile-menu-close";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close menu");
    closeButton.innerHTML = icon("close");
    header.append(closeButton);
    panel.append(header);

    const menuNav = document.createElement("nav");
    menuNav.className = "mobile-menu-links";
    menuNav.setAttribute("aria-label", "Main menu links");
    const makeLink = (source) => {
      const link = source.cloneNode(true);
      link.className = "mobile-menu-link";
      link.removeAttribute("role");
      link.insertAdjacentHTML("beforeend", `<span class="mobile-menu-arrow">${icon("arrow")}</span>`);
      return link;
    };

    const quickLinks = document.createElement("div");
    quickLinks.className = "mobile-menu-quick-links";
    [
      { label: "Soft Play Hire", href: "/services/soft-play/", icon: "blocks" },
      { label: "Toy Library", match: "Toy Library", icon: "toy" },
    ].forEach(({ label, href, match, icon: quickIcon }) => {
      const source = match && Array.from(navList.querySelectorAll(":scope > .nav-link")).find(
        (link) => link.textContent.trim() === match,
      );
      const link = source ? source.cloneNode(true) : document.createElement("a");
      link.className = "mobile-menu-quick-link";
      if (href) link.href = href;
      link.textContent = label;
      link.insertAdjacentHTML("afterbegin", `<span class="mobile-menu-quick-icon">${icon(quickIcon)}</span>`);
      quickLinks.append(link);
    });
    if (quickLinks.childElementCount) menuNav.append(quickLinks);

    ["Home", "Noticeboard", "Toy Library", "Contact"].forEach((label) => {
      const source = Array.from(navList.querySelectorAll(":scope > .nav-link")).find(
        (link) => link.textContent.trim() === label,
      );
      if (source) menuNav.append(makeLink(source));
    });

    navList.querySelectorAll(":scope > [data-dropdown]").forEach((dropdown) => {
      const titleLink = dropdown.querySelector(":scope > a");
      const title = dropdown.querySelector(".nav-drop-toggle")?.textContent.replace("▾", "").trim();
      const subLinks = dropdown.querySelectorAll(".nav-dropdown-content a");
      if (!titleLink || !title || !subLinks.length) return;
      const section = document.createElement("section");
      section.className = "mobile-menu-section";
      const row = document.createElement("div");
      row.className = "mobile-menu-section-row";
      const sectionLink = titleLink.cloneNode(true);
      sectionLink.className = "mobile-menu-section-link";
      sectionLink.textContent = title;
      const sectionButton = document.createElement("button");
      sectionButton.type = "button";
      sectionButton.className = "mobile-menu-section-toggle";
      sectionButton.setAttribute("aria-label", `Show ${title} links`);
      sectionButton.setAttribute("aria-expanded", "false");
      sectionButton.innerHTML = icon("chevron");
      row.append(sectionLink, sectionButton);
      const content = document.createElement("div");
      content.className = "mobile-menu-sub-links";
      Array.from(subLinks).forEach((source) => {
        const link = source.cloneNode(true);
        link.className = "mobile-menu-sub-link";
        content.append(link);
      });
      sectionButton.addEventListener("click", () => {
        const isOpen = section.classList.toggle("is-open");
        sectionButton.setAttribute("aria-expanded", String(isOpen));
        sectionButton.setAttribute("aria-label", `${isOpen ? "Hide" : "Show"} ${title} links`);
      });
      section.append(row, content);
      menuNav.append(section);
    });
    panel.append(menuNav);

    const footer = document.createElement("div");
    footer.className = "mobile-menu-footer";
    const supportLink = navList.querySelector(":scope > .nav-cta");
    if (supportLink) {
      const support = supportLink.cloneNode(true);
      support.className = "mobile-menu-support";
      support.insertAdjacentHTML("beforeend", `<span>${icon("arrow")}</span>`);
      footer.append(support);
    }
    const socialLinks = document.querySelector(".social-list");
    if (socialLinks) {
      const social = socialLinks.cloneNode(true);
      social.className = "mobile-menu-socials";
      footer.append(social);
    }
    panel.append(footer);
    document.body.append(backdrop, panel);

    const closeMenu = () => {
      if (panel.hidden) return;
      panel.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      document.body.classList.remove("mobile-menu-open");
      mobileToggle.setAttribute("aria-expanded", "false");
      window.setTimeout(() => {
        panel.hidden = true;
        backdrop.hidden = true;
      }, 260);
      mobileToggle.focus();
    };
    const openMenu = () => {
      panel.hidden = false;
      backdrop.hidden = false;
      requestAnimationFrame(() => {
        panel.classList.add("is-open");
        backdrop.classList.add("is-open");
      });
      document.body.classList.add("mobile-menu-open");
      mobileToggle.setAttribute("aria-expanded", "true");
      closeButton.focus();
    };

    mobileToggle.addEventListener("click", () => {
      if (!mobileNavQuery.matches) return;
      panel.hidden ? openMenu() : closeMenu();
    });
    closeButton.addEventListener("click", closeMenu);
    backdrop.addEventListener("click", closeMenu);
    panel.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
    return { closeMenu };
  };

  const menu = createMobileMenu();

  document.querySelectorAll("[data-dropdown] .nav-drop-toggle").forEach((button) => {
    button.addEventListener("click", (event) => {
      if (mobileNavQuery.matches) return;
      const dropdown = event.currentTarget.closest("[data-dropdown]");
      if (dropdown) dropdown.classList.toggle("open");
    });
  });

  const resetMobileMenu = (event) => {
    if (!event.matches && menu) menu.closeMenu();
  };
  if (typeof mobileNavQuery.addEventListener === "function") {
    mobileNavQuery.addEventListener("change", resetMobileMenu);
  } else if (typeof mobileNavQuery.addListener === "function") {
    mobileNavQuery.addListener(resetMobileMenu);
  }
});
