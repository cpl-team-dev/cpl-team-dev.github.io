document.addEventListener("DOMContentLoaded", () => {
  const chipRow = document.getElementById("toy-library-chip-row");
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

  if (!chipRow || !summary || !grid || !showMoreButton) {
    return;
  }

  const endpoint = `${API_BASE_URL.replace(/\/$/, "")}/product?${new URLSearchParams({
    organisation_id: ORGANISATION_ID,
    startRow: 1,
    endRow: 5000,
  }).toString()}`;
  const initialCategoryParam =
    new URLSearchParams(window.location.search).get("category")?.trim() || "";
  const placeholderImage =
    "../../assets/images/no-image-available-icon.jpg";
  const pageSize = 48;

  let allProducts = [];
  let activeCategory = "All";
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

  function updateCategoryQueryParam(category) {
    const url = new URL(window.location.href);

    if (category && category !== "All") {
      url.searchParams.set("category", category);
    } else {
      url.searchParams.delete("category");
    }

    window.history.replaceState({}, "", url);
  }

  function resolveInitialCategory() {
    if (!initialCategoryParam) {
      return "All";
    }

    const matchedCategory = getCategories().find(
      (category) => category.toLowerCase() === initialCategoryParam.toLowerCase(),
    );

    return matchedCategory || "All";
  }

  function pinActiveChipToLeft(activeChip, smooth = true) {
    if (!activeChip) {
      return;
    }

    const targetLeft = activeChip.offsetLeft - chipRow.offsetLeft;
    chipRow.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: smooth ? "smooth" : "auto",
    });
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

  function renderCategories() {
    clearElement(chipRow);

    getCategories().forEach((category) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = `toy-library-chip${category === activeCategory ? " is-active" : ""}`;
      chip.textContent = category;
      chip.addEventListener("click", () => {
        activeCategory = category;
        visibleCount = pageSize;
        updateCategoryQueryParam(activeCategory);
        renderCategories();
        renderProducts();
      });
      chipRow.appendChild(chip);

      if (category === activeCategory) {
        requestAnimationFrame(() => {
          pinActiveChipToLeft(chip);
        });
      }
    });
  }

  function getFilteredProducts() {
    if (activeCategory === "All") {
      return allProducts;
    }

    return allProducts.filter((product) => product.category === activeCategory);
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
      activeCategory === "All" ? "all categories" : activeCategory;

    summary.textContent = `Showing ${formatNumber(showing)} of ${formatNumber(
      filteredProducts.length,
    )} products in ${categoryLabel}.`;
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
      renderStatus("No products are available in this category right now.");
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
      activeCategory = resolveInitialCategory();
      visibleCount = pageSize;

      if (allProducts.length === 0) {
        clearElement(chipRow);
        summary.textContent = "";
        renderStatus("No products are available right now.");
        showMoreButton.hidden = true;
        return;
      }

      updateCategoryQueryParam(activeCategory);
      renderCategories();
      renderProducts();
    } catch (error) {
      clearElement(chipRow);
      summary.textContent = "";
      showMoreButton.hidden = true;
      renderStatus("We couldn't load the catalogue right now.");
      console.error("Failed to load toy library products:", error);
    }
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
