const PRODUCT_LIST_PATH = "/product";
const PRODUCT_PAGE_SIZE = 12;
const PRODUCT_IMAGE_COLUMN = { key: "image_preview", label: "Image" };
const PRODUCT_TABLE_FIELD_KEYS = [
  "name",
  "category",
  "created_at",
];
const PRODUCT_IMAGE_CANDIDATE_KEYS = [
  "image",
  "image_url",
  "image_src",
  "image_link",
  "image_path",
  "thumbnail",
  "thumbnail_url",
  "photo",
  "photo_url",
  "picture",
  "picture_url",
  "featured_image",
  "featured_image_url",
  "img",
  "img_url",
];

// Product columns are fully header-driven on the backend sheet (see
// apps-script/product/Code.js — any column other than id/organisation_id
// becomes a writable field automatically). Seed with the fields we know
// about today; extendFieldsFromRecords() below adds anything new it sees
// in loaded records, so a column added to the sheet shows up here without
// a frontend change.
const DEFAULT_PRODUCT_FIELDS = [
  { key: "name", label: "Name", type: "text", required: true },
];

const IGNORED_PRODUCT_KEYS = new Set(["id", "organisation_id"]);
const HIDDEN_PRODUCT_FORM_KEYS = new Set([
  "price",
  "currency",
  "currency_symbol",
  "stock",
  "weight",
  "dimensions",
  "custom",
]);

let session = null;
let products = [];
let totalProducts = 0;
let totalProductsKnown = false;
let currentPage = 1;
let hasMoreProducts = false;
let editingId = null;
let productFields = DEFAULT_PRODUCT_FIELDS.slice();

document.addEventListener("DOMContentLoaded", () => {
  session = requireManageSession("./login.html");
  if (!session) return;

  wireChrome();
  loadProducts(1);
});

function wireChrome() {
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => manageLogout("./login.html"));
  }

  const accountEmail = document.getElementById("account-email");
  if (accountEmail) {
    accountEmail.textContent = session.email || "staff member";
  }

  const addButton = document.getElementById("add-product-button");
  if (addButton) {
    addButton.addEventListener("click", () => openForm());
  }

  const previousButton = document.getElementById("previous-page-button");
  if (previousButton) {
    previousButton.addEventListener("click", () => {
      if (currentPage > 1) loadProducts(currentPage - 1);
    });
  }

  const nextButton = document.getElementById("next-page-button");
  if (nextButton) {
    nextButton.addEventListener("click", () => {
      if (hasNextPage()) loadProducts(currentPage + 1);
    });
  }

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      const modal = button.closest(".manage-modal");
      if (modal) closeModal(modal);
    });
  });

  const form = document.getElementById("product-form");
  if (form) {
    form.addEventListener("submit", handleSubmit);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    document.querySelectorAll(".manage-modal").forEach((modal) => {
      if (!modal.hidden) closeModal(modal);
    });
  });
}

function extendFieldsFromRecords(records) {
  const knownKeys = new Set(productFields.map((field) => field.key));

  records.forEach((record) => {
    Object.keys(record || {}).forEach((key) => {
      if (IGNORED_PRODUCT_KEYS.has(key) || knownKeys.has(key)) return;
      knownKeys.add(key);
      productFields.push({
        key: key,
        label: humanizeKey(key),
        type: typeof record[key] === "number" ? "number" : "text",
      });
    });
  });
}

function humanizeKey(key) {
  return key
    .split("_")
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(" ");
}

async function loadProducts(pageNumber) {
  const statusBanner = document.getElementById("status-banner");
  setStatus(statusBanner, "", "info");
  setProductsLoading(true);

  try {
    const requestedPage = Math.max(1, Number(pageNumber) || 1);
    const startRow = (requestedPage - 1) * PRODUCT_PAGE_SIZE + 1;
    const result = await manageApiGet(PRODUCT_LIST_PATH, {
      startRow: startRow,
      endRow: startRow + PRODUCT_PAGE_SIZE - 1,
    });

    const page = extractApiList(result);
    const pagination = extractApiPagination(result, startRow, PRODUCT_PAGE_SIZE, page.length);
    extendFieldsFromRecords(page);
    products = page;
    currentPage = requestedPage;
    hasMoreProducts = pagination.hasMore;

    if (typeof result.count === "number" && Number.isFinite(result.count)) {
      totalProducts = result.count;
      totalProductsKnown = true;
    } else {
      totalProducts = Math.max(0, startRow + page.length - 1);
      totalProductsKnown = !pagination.hasMore;
    }

    renderFormFields();
    renderTable();
    renderPagination();
  } catch (error) {
    setStatus(statusBanner, error.message || "Unable to load products.", "error");
  } finally {
    setProductsLoading(false);
  }
}

function setProductsLoading(isLoading) {
  const loadingIndicator = document.getElementById("products-loading");
  const table = document.querySelector(".manage-products-table");
  const previousButton = document.getElementById("previous-page-button");
  const nextButton = document.getElementById("next-page-button");

  if (loadingIndicator) {
    loadingIndicator.hidden = !isLoading;
  }

  if (table) {
    table.hidden = isLoading;
    table.setAttribute("aria-busy", isLoading ? "true" : "false");
  }

  if (previousButton) {
    previousButton.disabled = isLoading || currentPage <= 1;
  }

  if (nextButton) {
    nextButton.disabled = isLoading || !hasNextPage();
  }
}

function renderFormFields() {
  const container = document.getElementById("product-form-fields");
  if (!container) return;
  container.innerHTML = getEditableProductFields().map(renderFieldMarkup).join("");
}

function renderFieldMarkup(field) {
  const requiredAttr = field.required ? "required" : "";
  const requiredMark = field.required ? '<span class="required">*</span>' : "";
  const id = `product-field-${field.key}`;
  const inputType = field.type === "number" ? "number" : "text";
  const step = field.type === "number" ? 'step="0.01"' : "";

  return `
    <div class="field">
      <label for="${id}">${field.label} ${requiredMark}</label>
      <input id="${id}" name="${field.key}" type="${inputType}" ${step} ${requiredAttr} />
    </div>
  `;
}

function renderTable() {
  const thead = document.getElementById("products-table-head");
  const tbody = document.getElementById("products-table-body");
  if (!thead || !tbody) return;
  const tableFields = getVisibleTableFields();

  thead.innerHTML = `<tr>${tableFields
    .map((field) => `<th class="col-${escapeHtml(field.key)}">${escapeHtml(field.label)}</th>`)
    .join("")}<th>Actions</th></tr>`;

  if (products.length === 0) {
    tbody.innerHTML = `<tr class="manage-empty-row"><td colspan="${
      tableFields.length + 1
    }">No products yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = products
    .map(
      (product) => `
        <tr data-id="${escapeHtml(product.id)}">
          ${tableFields
            .map((field) => renderTableCell(field, product))
            .join("")}
          <td class="row-actions">
            <button class="text-button" type="button" data-action="edit">Edit</button>
            <button class="danger-button" type="button" data-action="delete">Delete</button>
          </td>
        </tr>
      `,
    )
    .join("");

  tbody.querySelectorAll("button[data-action]").forEach((button) => {
    const row = button.closest("tr");
    const id = row && row.dataset.id;
    const product = products.find((item) => String(item.id) === id);
    if (!product) return;

    if (button.dataset.action === "edit") {
      button.addEventListener("click", () => openForm(product));
    } else {
      button.addEventListener("click", () => handleDelete(product));
    }
  });

  tbody.querySelectorAll("button[data-preview-image]").forEach((button) => {
    button.addEventListener("click", () => {
      openImagePreview(button.dataset.previewImage, button.dataset.previewTitle);
    });
  });
}

function getVisibleTableFields() {
  const fieldsByKey = new Map(productFields.map((field) => [field.key, field]));
  const preferredFields = PRODUCT_TABLE_FIELD_KEYS.map((key) => fieldsByKey.get(key)).filter(
    Boolean,
  );

  if (preferredFields.length > 0) {
    return [PRODUCT_IMAGE_COLUMN, ...preferredFields];
  }

  return [PRODUCT_IMAGE_COLUMN, ...productFields.slice(0, 5)];
}

function renderTableCell(field, product) {
  if (field.key === PRODUCT_IMAGE_COLUMN.key) {
    return renderImageCell(product);
  }
  const content = getProductTableCellContent(field, product[field.key]);
  const titleAttr = content.title ? ` title="${escapeHtml(content.title)}"` : "";
  return `<td class="col-${escapeHtml(field.key)}"${titleAttr}>${content.html}</td>`;
}

function renderImageCell(product) {
  const imageUrl = getProductImageUrl(product);
  if (!imageUrl) {
    return '<td class="col-image_preview"><span class="cell-muted">—</span></td>';
  }

  const previewTitle = product && product.name ? `${product.name} image` : "Product image";
  return `
    <td class="col-image_preview">
      <button
        class="manage-product-thumb"
        type="button"
        data-preview-image="${escapeHtml(imageUrl)}"
        data-preview-title="${escapeHtml(previewTitle)}"
        aria-label="Preview ${escapeHtml(previewTitle)}"
      >
        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(previewTitle)}" loading="lazy" />
      </button>
    </td>
  `;
}

function getProductTableCellContent(field, value) {
  if (value === undefined || value === null || value === "") {
    return {
      html: '<span class="cell-muted">—</span>',
      title: "",
    };
  }

  const text =
    field.key === "created_at" ? formatProductTableDate(value) : String(value);
  const escapedText = escapeHtml(text);

  if (field.key === "name") {
    return {
      html: `<div class="manage-cell-title">${escapedText}</div>`,
      title: text,
    };
  }

  if (field.key === "category") {
    return {
      html: `<span class="manage-cell-chip">${escapedText}</span>`,
      title: text,
    };
  }

  if (field.key === "created_at") {
    return {
      html: `<span class="manage-cell-meta">${escapedText}</span>`,
      title: String(value),
    };
  }

  return {
    html: escapedText,
    title: text,
  };
}

function formatProductTableDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(value);
  }

  if (typeof value !== "string" && typeof value !== "number") {
    return String(value);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function renderPagination() {
  const previousButton = document.getElementById("previous-page-button");
  const nextButton = document.getElementById("next-page-button");
  const status = document.getElementById("pagination-status");
  const pageStart = products.length > 0 ? (currentPage - 1) * PRODUCT_PAGE_SIZE + 1 : 0;
  const pageEnd = products.length > 0 ? pageStart + products.length - 1 : 0;

  if (previousButton) previousButton.disabled = currentPage <= 1;
  if (nextButton) nextButton.disabled = !hasNextPage();

  if (status) {
    if (products.length === 0) {
      status.textContent = "No products to display";
    } else if (totalProductsKnown) {
      status.textContent = `Showing ${pageStart}-${pageEnd} of ${totalProducts} products`;
    } else {
      status.textContent = hasMoreProducts
        ? `Showing ${pageStart}-${pageEnd} products`
        : `Showing ${pageStart}-${pageEnd} of ${pageEnd} products`;
    }
  }
}

function hasNextPage() {
  return hasMoreProducts;
}

function formatValue(value) {
  return value === undefined || value === null || value === "" ? "—" : value;
}

function openForm(product) {
  editingId = product ? product.id : null;

  const modal = document.getElementById("product-modal");
  const title = document.getElementById("product-modal-title");
  if (title) title.textContent = product ? "Edit product" : "Add product";

  getEditableProductFields().forEach((field) => {
    const input = document.getElementById(`product-field-${field.key}`);
    if (input) {
      const value = product ? product[field.key] : undefined;
      input.value = value === undefined || value === null ? "" : value;
    }
  });

  setStatus(document.getElementById("form-status-banner"), "", "info");

  showModal(modal);
}

function closeForm() {
  closeModal(document.getElementById("product-modal"));
}

async function handleSubmit(event) {
  event.preventDefault();
  const statusBanner = document.getElementById("form-status-banner");
  setStatus(statusBanner, "", "info");

  const record = {};
  getEditableProductFields().forEach((field) => {
    const input = document.getElementById(`product-field-${field.key}`);
    if (!input) return;
    const raw = input.value.trim();
    record[field.key] = field.type === "number" && raw !== "" ? Number(raw) : raw;
  });

  HIDDEN_PRODUCT_FORM_KEYS.forEach((key) => {
    record[key] = "";
  });

  if (!record.name) {
    setStatus(statusBanner, "Name is required.", "error");
    return;
  }

  const submitButton = document.getElementById("product-submit-button");
  if (submitButton) submitButton.disabled = true;

  try {
    const wasEditing = Boolean(editingId);
    const body = editingId
      ? { subMethodType: "PUT", record: Object.assign({ id: editingId }, record) }
      : { record: record };

    await manageApiPost(PRODUCT_LIST_PATH, body, session);
    closeForm();
    await loadProducts(wasEditing ? currentPage : 1);
    setStatus(document.getElementById("status-banner"), "Product saved.", "success");
  } catch (error) {
    setStatus(statusBanner, error.message || "Unable to save product.", "error");
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}

async function handleDelete(product) {
  if (!window.confirm(`Delete "${product.name || product.id}"? This cannot be undone.`)) {
    return;
  }

  const statusBanner = document.getElementById("status-banner");

  try {
    await manageApiPost(PRODUCT_LIST_PATH, { subMethodType: "DELETE", id: product.id }, session);
    const targetPage = products.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
    totalProducts = Math.max(0, totalProducts - 1);
    await loadProducts(targetPage);
    setStatus(statusBanner, "Product deleted.", "success");
  } catch (error) {
    setStatus(statusBanner, error.message || "Unable to delete product.", "error");
  }
}

function getEditableProductFields() {
  return productFields.filter((field) => !HIDDEN_PRODUCT_FORM_KEYS.has(field.key));
}

function getProductImageUrl(product) {
  if (!product || typeof product !== "object") return "";

  for (const key of PRODUCT_IMAGE_CANDIDATE_KEYS) {
    if (isLikelyImageUrl(product[key])) return String(product[key]).trim();
  }

  const matchingImageKey = Object.keys(product).find(
    (key) => /image|thumbnail|photo|picture|img/i.test(key) && isLikelyImageUrl(product[key]),
  );
  if (matchingImageKey) return String(product[matchingImageKey]).trim();

  const matchingUrlKey = Object.keys(product).find(
    (key) => /url|src|link|path/i.test(key) && isLikelyImageUrl(product[key]),
  );
  if (matchingUrlKey) return String(product[matchingUrlKey]).trim();

  const matchingValue = Object.values(product).find((value) => isLikelyImageUrl(value));
  return matchingValue ? String(matchingValue).trim() : "";
}

function isLikelyImageUrl(value) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;

  const hasImageProtocol =
    /^data:image\//i.test(trimmed) ||
    /^(https?:)?\/\//i.test(trimmed) ||
    /^\/(?!\/)/.test(trimmed) ||
    /^\.\.?\//.test(trimmed);
  const looksLikeImageAsset =
    /\.(avif|gif|jpe?g|png|svg|webp)(\?|#|$)/i.test(trimmed) ||
    /imagekit|cloudinary/i.test(trimmed);

  return hasImageProtocol && looksLikeImageAsset;
}

function openImagePreview(imageUrl, title) {
  const modal = document.getElementById("product-image-modal");
  const image = document.getElementById("product-image-modal-image");
  const heading = document.getElementById("product-image-modal-title");
  if (!modal || !image || !imageUrl) return;

  const previewTitle = title || "Product image";
  if (heading) heading.textContent = previewTitle;
  image.src = imageUrl;
  image.alt = previewTitle;
  showModal(modal);
}

function showModal(modal) {
  if (!modal) return;
  modal.hidden = false;
}

function closeModal(modal) {
  if (!modal) return;
  modal.hidden = true;

  if (modal.id === "product-modal") {
    editingId = null;
  }

  if (modal.id === "product-image-modal") {
    const image = document.getElementById("product-image-modal-image");
    if (image) {
      image.src = "";
      image.alt = "";
    }
  }
}

function setStatus(banner, message, state) {
  if (!banner) return;
  if (!message) {
    banner.hidden = true;
    banner.textContent = "";
    return;
  }
  banner.hidden = false;
  banner.textContent = message;
  banner.dataset.state = state || "info";
}

function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
  );
}
