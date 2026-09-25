document.addEventListener("DOMContentLoaded", () => {
  const chipRow = document.getElementById("toy-library-chip-row");
  const activeChipRow = document.getElementById("toy-library-active-chips");
  const chipScrollShell = chipRow?.closest(".toy-library-chip-scroll-shell");
  const chipLimitNote = document.getElementById("toy-library-chip-limit");
  const searchInput = document.getElementById("toy-library-search");
  const summary = document.getElementById("toy-library-results-summary");
  const grid = document.getElementById("toy-library-grid");
  const showMoreButton = document.getElementById("toy-library-show-more");
  const imagePreview = document.getElementById("toy-library-image-preview");
  const imagePreviewTitle = document.getElementById(
    "toy-library-image-preview-title",
  );
  const imagePreviewImage = document.getElementById(
    "toy-library-image-preview-image",
  );
  const imagePreviewCloseButton = document.getElementById(
    "toy-library-image-preview-close",
  );
  const desktopPreviewQuery = window.matchMedia(
    "(min-width: 1101px) and (hover: hover) and (pointer: fine)",
  );

  if (!chipRow || !activeChipRow || !summary || !grid || !showMoreButton) {
    return;
  }

  const endpoint = `${API_BASE_URL.replace(/\/$/, "")}/product?${new URLSearchParams({
    organisation_id: ORGANISATION_ID,
  }).toString()}`;
  const initialParams = new URLSearchParams(window.location.search);
  const initialCategoryParams = initialParams
    .getAll("category")
    .map((value) => value.trim())
    .filter(Boolean);
  const initialSearchParam = initialParams.get("q")?.trim() || "";
  const placeholderImage =
    "../../assets/images/no-image-available-icon.jpg";
  const pageSize = 48;
  const maxActiveCategories = 3;
  const searchDebounceMs = 300;

  let allProducts = [];
  // Empty means "All"; otherwise the categories in the order they were picked.
  let activeCategories = [];
  let searchTerm = initialSearchParam;
  let searchDebounceTimer = 0;
  let visibleCount = pageSize;
  let lastActiveCard = null;

  function clearElement(element) {
    element.replaceChildren();
  }

  function canOpenDesktopPreview() {
    return (
      desktopPreviewQuery.matches &&
      imagePreview &&
      imagePreviewTitle &&
      imagePreviewImage &&
      imagePreviewCloseButton
    );
  }

  function closeImagePreview() {
    if (!imagePreview || !imagePreviewTitle || !imagePreviewImage) {
      return;
    }

    imagePreview.hidden = true;
    imagePreview.setAttribute("aria-hidden", "true");
    imagePreviewTitle.textContent = "";
    imagePreviewImage.src = "";
    imagePreviewImage.alt = "";
    document.body.style.overflow = "";

    if (lastActiveCard) {
      lastActiveCard.focus();
      lastActiveCard = null;
    }
  }

  function openImagePreview(product, sourceCard) {
    if (!canOpenDesktopPreview()) {
      return;
    }

    lastActiveCard = sourceCard;
    imagePreview.hidden = false;
    imagePreview.setAttribute("aria-hidden", "false");
    imagePreviewTitle.textContent = product.name;
    imagePreviewImage.src = product.imageUrl || placeholderImage;
    imagePreviewImage.alt = product.name;
    document.body.style.overflow = "hidden";
    imagePreviewCloseButton.focus();
  }

  function syncPreviewableCards() {
    const cards = grid.querySelectorAll(".toy-library-card");

    cards.forEach((card) => {
      if (canOpenDesktopPreview()) {
        card.tabIndex = 0;
        card.setAttribute(
          "aria-label",
          card.getAttribute("data-preview-label") || "Open a larger image",
        );
        card.setAttribute("aria-haspopup", "dialog");
      } else {
        card.removeAttribute("tabindex");
        card.removeAttribute("aria-label");
        card.removeAttribute("aria-haspopup");
      }
    });
  }

  function createSkeletonCard() {
    const article = document.createElement("article");
    article.className = "toy-library-card toy-library-skeleton-card";
    article.setAttribute("aria-hidden", "true");

    const media = document.createElement("div");
    media.className = "toy-library-card-media toy-library-skeleton-block";

    const copy = document.createElement("div");
    copy.className = "toy-library-card-copy";

    const eyebrow = document.createElement("div");
    eyebrow.className =
      "toy-library-skeleton-line toy-library-skeleton-line-short";

    const title = document.createElement("div");
    title.className = "toy-library-skeleton-line";

    const action = document.createElement("div");
    action.className =
      "toy-library-skeleton-line toy-library-skeleton-line-medium";

    copy.append(eyebrow, title, action);
    article.append(media, copy);

    return article;
  }

  function renderSkeletons(count = 8) {
    grid.innerHTML = "";

    for (let index = 0; index < count; index += 1) {
      grid.appendChild(createSkeletonCard());
    }
  }

  function renderStatus(message) {
    grid.innerHTML = "";

    const card = document.createElement("article");
    card.className = "toy-library-status-card";

    const text = document.createElement("p");
    text.textContent = message;

    card.appendChild(text);
    grid.appendChild(card);
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("en-GB").format(value);
  }

  function updateQueryParams() {
    const url = new URL(window.location.href);

    url.searchParams.delete("category");
    activeCategories.forEach((category) => {
      url.searchParams.append("category", category);
    });

    if (searchTerm) {
      url.searchParams.set("q", searchTerm);
    } else {
      url.searchParams.delete("q");
    }

    window.history.replaceState({}, "", url);
  }

  function resolveInitialCategories() {
    const categories = getCategories();
    const matched = [];

    initialCategoryParams.forEach((param) => {
      const category = categories.find(
        (candidate) =>
          candidate !== "All" && candidate.toLowerCase() === param.toLowerCase(),
      );

      if (category && !matched.includes(category)) {
        matched.push(category);
      }
    });

    return matched.slice(0, maxActiveCategories);
  }

  function getCategories() {
    return [
      "All",
      ...new Set(allProducts.map((product) => product.category).filter(Boolean)),
    ].sort((a, b) => {
      if (a === "All") return -1;
      if (b === "All") return 1;
      return a.localeCompare(b);
    });
  }

  function applyFilters() {
    visibleCount = pageSize;
    updateQueryParams();
    renderCategories();
    renderProducts();
  }

  function toggleCategory(category) {
    if (category === "All") {
      activeCategories = [];
    } else if (activeCategories.includes(category)) {
      activeCategories = activeCategories.filter((item) => item !== category);
    } else if (activeCategories.length < maxActiveCategories) {
      activeCategories = [...activeCategories, category];
    } else {
      return;
    }

    applyFilters();
  }

  function createChip(category, { active, disabled }) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "toy-library-chip";
    chip.textContent = category;

    if (active) {
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");

      if (category !== "All") {
        chip.classList.add("is-removable");
        chip.setAttribute("aria-label", `Remove ${category} filter`);
      }
    } else {
      chip.setAttribute("aria-pressed", "false");
    }

    if (disabled) {
      chip.classList.add("is-disabled");
      chip.setAttribute("aria-disabled", "true");
      chip.title = `You can pick up to ${maxActiveCategories} categories`;
    }

    chip.addEventListener("click", () => {
      if (!disabled) {
        toggleCategory(category);
      }
    });

    return chip;
  }

  // Active chips stay pinned on the left of the separator; everything else
  // lives in the scrollable row to its right.
  function renderCategories() {
    clearElement(activeChipRow);
    clearElement(chipRow);

    const isAll = activeCategories.length === 0;
    const atLimit = activeCategories.length >= maxActiveCategories;

    if (isAll) {
      activeChipRow.appendChild(createChip("All", { active: true }));
    } else {
      activeCategories.forEach((category) => {
        activeChipRow.appendChild(createChip(category, { active: true }));
      });
    }

    getCategories().forEach((category) => {
      if (isAll && category === "All") return;
      if (activeCategories.includes(category)) return;

      chipRow.appendChild(
        createChip(category, {
          active: false,
          disabled: atLimit && category !== "All",
        }),
      );
    });

    if (chipLimitNote) {
      chipLimitNote.hidden = !atLimit;
    }

    chipRow.scrollLeft = 0;
    updateChipScrollHints();
  }

  function updateChipScrollHints() {
    if (!chipScrollShell) return;

    const overflow = chipRow.scrollWidth - chipRow.clientWidth;
    chipScrollShell.classList.toggle("is-scrollable", overflow > 4);
    chipScrollShell.classList.toggle("is-at-start", chipRow.scrollLeft <= 4);
    chipScrollShell.classList.toggle(
      "is-at-end",
      chipRow.scrollLeft >= overflow - 4,
    );
  }

  function getFilteredProducts() {
    const query = searchTerm.toLowerCase();

    return allProducts.filter(
      (product) =>
        (activeCategories.length === 0 ||
          activeCategories.includes(product.category)) &&
        (!query || product.name.toLowerCase().includes(query)),
    );
  }

  function formatCategoryList(categories) {
    if (categories.length <= 1) return categories.join("");
    return `${categories.slice(0, -1).join(", ")} and ${categories.at(-1)}`;
  }

  function createProductCard(product) {
    const article = document.createElement("article");
    article.className = "toy-library-card";
    article.setAttribute(
      "data-preview-label",
      `Open a larger image of ${product.name}`,
    );

    const media = document.createElement("div");
    media.className = "toy-library-card-media";

    const image = document.createElement("img");
    image.src = product.imageUrl || placeholderImage;
    image.alt = product.name;
    image.loading = "lazy";
    media.appendChild(image);

    const copy = document.createElement("div");
    copy.className = "toy-library-card-copy";

    const category = document.createElement("p");
    category.className = "toy-library-card-category";
    category.textContent = product.category;

    const name = document.createElement("h3");
    name.textContent = product.name;

    const barcode = document.createElement("p");
    barcode.className = "toy-library-card-code";
    barcode.textContent = `Barcode: ${product.sku}`;

    const link = document.createElement("a");
    link.className = "toy-library-card-link";
    link.href = `mailto:CPLTeam@community-playlink.com?subject=${encodeURIComponent(
      `Toy Library enquiry - ${product.name}`,
    )}`;
    link.textContent = "Ask about this toy";

    article.addEventListener("click", (event) => {
      if (event.target.closest(".toy-library-card-link")) {
        return;
      }

      openImagePreview(product, article);
    });

    article.addEventListener("keydown", (event) => {
      if (event.target.closest(".toy-library-card-link")) {
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openImagePreview(product, article);
      }
    });

    if (product.sku) {
      copy.append(category, name, barcode, link);
    } else {
      copy.append(category, name, link);
    }
    article.append(media, copy);

    return article;
  }

  function renderSummary(filteredProducts) {
    const showing = Math.min(filteredProducts.length, visibleCount);
    const categoryLabel =
      activeCategories.length === 0
        ? "all categories"
        : formatCategoryList(activeCategories);
    const searchLabel = searchTerm ? ` matching \u201c${searchTerm}\u201d` : "";

    summary.textContent = `Showing ${formatNumber(showing)} of ${formatNumber(
      filteredProducts.length,
    )} products${searchLabel} in ${categoryLabel}.`;
  }

  function renderShowMore(filteredProducts) {
    const hasMore = filteredProducts.length > visibleCount;
    showMoreButton.hidden = !hasMore;
  }

  function renderProducts() {
    const filteredProducts = getFilteredProducts();
    renderSummary(filteredProducts);
    clearElement(grid);

    if (filteredProducts.length === 0) {
      renderStatus(
        searchTerm
          ? "No products match your search right now."
          : "No products are available in this category right now.",
      );
      renderShowMore(filteredProducts);
      return;
    }

    filteredProducts.slice(0, visibleCount).forEach((product) => {
      grid.appendChild(createProductCard(product));
    });

    syncPreviewableCards();
    renderShowMore(filteredProducts);
  }

  function normalisePayload(payload) {
    const records = Array.isArray(payload.products)
      ? payload.products
      : Array.isArray(payload.records)
        ? payload.records
        : [];

    return {
      organisationId:
        typeof payload.organisation_id === "string" ? payload.organisation_id : "",
      count:
        typeof payload.count === "number" && Number.isFinite(payload.count)
          ? payload.count
          : records.length,
      products: records
        .map((record) => ({
          category:
            typeof record.category === "string" && record.category.trim()
              ? record.category.trim()
              : "Uncategorised",
          name:
            typeof record.name === "string" && record.name.trim()
              ? record.name.trim()
              : "",
          imageUrl:
            typeof record.image_url === "string" && record.image_url.trim()
              ? record.image_url.trim()
              : "",
          sku:
            typeof record.sku === "string" || typeof record.sku === "number"
              ? String(record.sku).trim()
              : "",
        }))
        .filter((product) => product.name)
        .sort(
          (a, b) =>
            a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
        ),
    };
  }

  async function fetchPayload(url) {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const payload = await response.json();

    if (!payload.ok) {
      throw new Error("API returned an unsuccessful response.");
    }

    return payload;
  }

  async function loadProducts() {
    renderSkeletons();

    try {
      const payload = await fetchPayload(endpoint);
      const normalised = normalisePayload(payload);
      allProducts = normalised.products;
      activeCategories = resolveInitialCategories();
      visibleCount = pageSize;

      if (allProducts.length === 0) {
        clearElement(chipRow);
        clearElement(activeChipRow);
        summary.textContent = "";
        renderStatus("No products are available right now.");
        showMoreButton.hidden = true;
        return;
      }

      updateQueryParams();
      renderCategories();
      renderProducts();
    } catch (error) {
      clearElement(chipRow);
      clearElement(activeChipRow);
      summary.textContent = "";
      showMoreButton.hidden = true;
      renderStatus("We couldn't load the catalogue right now.");
      console.error("Failed to load toy library products:", error);
    }
  }

  chipRow.addEventListener("scroll", updateChipScrollHints, { passive: true });
  window.addEventListener("resize", updateChipScrollHints);

  if (typeof ResizeObserver === "function") {
    new ResizeObserver(updateChipScrollHints).observe(chipRow);
  }

  chipScrollShell
    ?.querySelectorAll("[data-scroll-direction]")
    .forEach((hint) => {
      hint.addEventListener("click", () => {
        const direction = Number(hint.dataset.scrollDirection) || 1;
        chipRow.scrollBy({
          left: direction * chipRow.clientWidth * 0.8,
          behavior: "smooth",
        });
      });
    });

  if (searchInput) {
    searchInput.value = searchTerm;

    searchInput.addEventListener("input", () => {
      window.clearTimeout(searchDebounceTimer);
      searchDebounceTimer = window.setTimeout(() => {
        const nextTerm = searchInput.value.trim();
        if (nextTerm === searchTerm) return;

        searchTerm = nextTerm;
        // Filters render once products have loaded; before then just remember
        // the term so the first render picks it up.
        if (allProducts.length > 0) {
          visibleCount = pageSize;
          updateQueryParams();
          renderProducts();
        }
      }, searchDebounceMs);
    });
  }

  showMoreButton.addEventListener("click", () => {
    visibleCount += pageSize;
    renderProducts();
  });

  if (imagePreview && imagePreviewCloseButton) {
    imagePreview.addEventListener("click", (event) => {
      if (event.target.hasAttribute("data-toy-library-preview-close")) {
        closeImagePreview();
      }
    });

    imagePreviewCloseButton.addEventListener("click", () => {
      closeImagePreview();
    });

    desktopPreviewQuery.addEventListener("change", (event) => {
      syncPreviewableCards();

      if (!event.matches) {
        closeImagePreview();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && imagePreview.hidden === false) {
        closeImagePreview();
      }
    });
  }

  loadProducts();
});
