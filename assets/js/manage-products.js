const PRODUCT_LIST_PATH = "/product";
const PRODUCT_SESSION_STORAGE_KEY = "manage-products-cache";
const PRODUCT_SESSION_STORAGE_REFRESHED_AT_KEY = "manage-products-cache-refreshed-at";
const PRODUCT_IMAGE_COLUMN = { key: "image_preview", label: "Image" };
const PRODUCT_TABLE_FIELD_KEYS = [
  "name",
  "sku",
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
  { key: "sku", label: "Barcode", type: "text" },
];

const IGNORED_PRODUCT_KEYS = new Set(["id", "organisation_id"]);
const HIDDEN_PRODUCT_FORM_KEYS = new Set([
  "created_at",
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
let editingId = null;
let deleteTargetProduct = null;
let isDeletePending = false;
let productFields = DEFAULT_PRODUCT_FIELDS.slice();
let productFilters = {};
let productFilterDebounceTimer = null;
const PRODUCT_FILTER_DEBOUNCE_MS = 500;
const PRODUCT_PAGE_SIZE = 50;
let currentProductPage = 1;

function getTurnstileToken(container) {
  if (!container) return "";

  if (container instanceof HTMLFormElement) {
    return new FormData(container).get("cf-turnstile-response")?.toString() || "";
  }

  const input = container.querySelector('[name="cf-turnstile-response"]');
  return input ? input.value?.toString() || "" : "";
}

function resetTurnstile(container) {
  if (window.turnstile) {
    window.turnstile.reset(container);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  session = requireManageSession("./login.html");
  if (!session) return;

  wireChrome();
  restoreProductsRefreshTimestamp();
  const cachedProducts = restoreProductsFromSessionStorage();
  if (cachedProducts) {
    applyLoadedProducts(cachedProducts);
  } else {
    loadProducts();
  }
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

  const refreshButton = document.getElementById("refresh-products-button");
  if (refreshButton) {
    refreshButton.addEventListener("click", handleRefreshProducts);
  }

  const previousButton = document.getElementById("previous-page-button");
  if (previousButton) {
    previousButton.addEventListener("click", () => changeProductPage(-1));
    previousButton.hidden = true;
    previousButton.disabled = true;
  }

  const nextButton = document.getElementById("next-page-button");
  if (nextButton) {
    nextButton.addEventListener("click", () => changeProductPage(1));
    nextButton.hidden = true;
    nextButton.disabled = true;
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

  const deleteConfirmButton = document.getElementById("product-delete-confirm-button");
  if (deleteConfirmButton) {
    deleteConfirmButton.addEventListener("click", handleDeleteConfirm);
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

async function loadProducts(options = {}) {
  const { showSuccessMessage = false, resetView = true } = options;
  const statusBanner = document.getElementById("status-banner");
  setStatus(statusBanner, "", "info");
  setProductsLoading(true);

  try {
    const loadedProducts = await fetchProductsFromEndpoint();
    if (resetView) {
      resetProductListViewState();
    }
    applyLoadedProducts(loadedProducts);

    if (showSuccessMessage) {
      setStatus(statusBanner, "Products refreshed.", "success");
    }
  } catch (error) {
    setStatus(statusBanner, error.message || "Unable to load products.", "error");
  } finally {
    setProductsLoading(false);
  }
}

async function fetchProductsFromEndpoint() {
  const result = await manageApiGet(PRODUCT_LIST_PATH);
  const loadedProducts = extractApiList(result);
  persistProductsToSessionStorage(loadedProducts);
  return loadedProducts;
}

function applyLoadedProducts(loadedProducts) {
  extendFieldsFromRecords(loadedProducts);
  products = loadedProducts;
  totalProducts = loadedProducts.length;
  totalProductsKnown = true;

  renderFormFields();
  renderTable();
}

function persistProductsToSessionStorage(loadedProducts) {
  const refreshedAt = new Date().toISOString();

  try {
    window.sessionStorage.setItem(PRODUCT_SESSION_STORAGE_KEY, JSON.stringify(loadedProducts));
    window.sessionStorage.setItem(PRODUCT_SESSION_STORAGE_REFRESHED_AT_KEY, refreshedAt);
    renderProductsRefreshTimestamp(refreshedAt);
  } catch (error) {
    console.warn("Unable to write product cache to sessionStorage.", error);
  }
}

function restoreProductsFromSessionStorage() {
  try {
    const cachedProducts = window.sessionStorage.getItem(PRODUCT_SESSION_STORAGE_KEY);
    if (!cachedProducts) return null;

    const parsedProducts = JSON.parse(cachedProducts);
    return Array.isArray(parsedProducts) ? parsedProducts : null;
  } catch (error) {
    console.warn("Unable to read product cache from sessionStorage.", error);
    return null;
  }
}

function restoreProductsRefreshTimestamp() {
  try {
    const refreshedAt = window.sessionStorage.getItem(PRODUCT_SESSION_STORAGE_REFRESHED_AT_KEY);
    renderProductsRefreshTimestamp(refreshedAt);
  } catch (error) {
    console.warn("Unable to read product refresh timestamp from sessionStorage.", error);
  }
}

function renderProductsRefreshTimestamp(value) {
  const timestamp = document.getElementById("products-last-refreshed");
  if (!timestamp) return;

  const formattedValue = formatProductsRefreshTimestamp(value);
  timestamp.textContent = `Last refreshed: ${formattedValue}`;
}

function formatProductsRefreshTimestamp(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

async function handleRefreshProducts() {
  await loadProducts({ showSuccessMessage: true });
}

function resetProductListViewState() {
  productFilters = {};
  currentProductPage = 1;
  clearScheduledProductFilterRender();
}

function setProductsLoading(isLoading) {
  const loadingIndicator = document.getElementById("products-loading");
  const table = document.querySelector(".manage-products-table");
  const previousButton = document.getElementById("previous-page-button");
  const nextButton = document.getElementById("next-page-button");
  const refreshButton = document.getElementById("refresh-products-button");

  if (loadingIndicator) {
    loadingIndicator.hidden = !isLoading;
  }

  if (table) {
    table.hidden = isLoading;
    table.setAttribute("aria-busy", isLoading ? "true" : "false");
  }

  if (previousButton) {
    previousButton.hidden = true;
    previousButton.disabled = true;
  }

  if (nextButton) {
    nextButton.hidden = true;
    nextButton.disabled = true;
  }

  if (refreshButton) {
    refreshButton.disabled = isLoading;
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
  const isTextarea = isProductTextareaField(field);

  if (isTextarea) {
    return `
      <div class="field">
        <label for="${id}">${field.label} ${requiredMark}</label>
        <textarea id="${id}" name="${field.key}" rows="6" ${requiredAttr}></textarea>
      </div>
    `;
  }

  const inputType = field.type === "number" ? "number" : "text";
  const step = field.type === "number" ? 'step="0.01"' : "";
  const datalistMarkup = getProductFieldDatalistMarkup(field);
  const listAttr = datalistMarkup ? `list="product-field-${field.key}-options"` : "";

  return `
    <div class="field">
      <label for="${id}">${field.label} ${requiredMark}</label>
      <input id="${id}" name="${field.key}" type="${inputType}" ${step} ${requiredAttr} ${listAttr} />
      ${datalistMarkup}
    </div>
  `;
}

function isProductTextareaField(field) {
  return field && field.key === "description";
}

function getProductFieldDatalistMarkup(field) {
  if (!field || field.key !== "category") return "";

  const options = getUniqueProductCategoryOptions();
  if (options.length === 0) return "";

  return `
    <datalist id="product-field-${field.key}-options">
      ${options.map((option) => `<option value="${escapeHtml(option)}"></option>`).join("")}
    </datalist>
  `;
}

function renderTable() {
  const thead = document.getElementById("products-table-head");
  const tbody = document.getElementById("products-table-body");
  if (!thead || !tbody) return;
  const tableFields = getVisibleTableFields();
  const filteredProducts = getFilteredProducts(tableFields);

  renderTableHead(thead, tableFields);
  renderTableBody(tbody, tableFields, filteredProducts);
}

function renderTableBody(tbody, tableFields, filteredProducts) {
  const pagination = getProductPagination(filteredProducts);
  const visibleProducts = pagination.items;

  if (filteredProducts.length === 0) {
    currentProductPage = 1;
    tbody.innerHTML = `<tr class="manage-empty-row"><td colspan="${
      tableFields.length + 1
    }">${
      hasActiveProductFilters() ? "No products match current filters." : "No products yet."
    }</td></tr>`;
    renderPagination(0, pagination);
    return;
  }

  tbody.innerHTML = visibleProducts
    .map(
      (product) => `
        <tr data-id="${escapeHtml(product.id)}">
          ${tableFields
            .map((field) => renderTableCell(field, product))
            .join("")}
          <td class="row-actions">
            ${renderManageActionButton("edit", "Edit product")}
            ${renderManageActionButton("delete", "Delete product")}
          </td>
        </tr>
      `,
    )
    .join("");

  tbody.querySelectorAll("button[data-action]").forEach((button) => {
    const row = button.closest("tr");
    const id = row && row.dataset.id;
    const product = visibleProducts.find((item) => String(item.id) === id);
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

  renderPagination(filteredProducts.length, pagination);
}

function renderTableHead(thead, tableFields) {
  thead.innerHTML = `
    <tr class="manage-filter-panel-row">
      <th colspan="${tableFields.length + 1}">
        ${renderProductFilterPanel(tableFields)}
      </th>
    </tr>
    <tr>
      ${tableFields
        .map((field) => `<th class="col-${escapeHtml(field.key)}">${field.key === "created_at" ? "Modified At" : escapeHtml(field.label)}</th>`)
        .join("")}
      <th>Actions</th>
    </tr>
  `;

  thead.querySelectorAll("[data-filter-key]").forEach((control) => {
    control.addEventListener("input", handleProductFilterChange);
    control.addEventListener("change", handleProductFilterChange);
  });

  const clearButton = document.getElementById("clear-product-filters");
  if (clearButton) {
    clearButton.addEventListener("click", clearProductFilters);
  }
}

function renderProductFilterPanel(tableFields) {
  const filterableFields = tableFields.filter((field) => field.key !== PRODUCT_IMAGE_COLUMN.key);

  return `
    <div class="manage-products-filter-panel">
      <div class="manage-products-filter-heading">Filters</div>
      <div class="manage-products-filter-grid">
        ${filterableFields
          .map(
            (field) => `
              <div class="manage-products-filter-field">
                <span class="manage-products-filter-label">${escapeHtml(getProductDisplayLabel(field))}</span>
                ${renderProductFilterControl(field)}
              </div>
            `,
          )
          .join("")}
        <div class="manage-products-filter-actions">
          <span class="manage-products-filter-label">Filters</span>
          <button
            id="clear-product-filters"
            class="secondary-button manage-filter-reset"
            type="button"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  `;
}

function getProductDisplayLabel(field) {
  return field.key === "created_at" ? "Modified At" : field.label;
}

function renderProductFilterControl(field) {
  if (field.key === "category") {
    return renderProductCategoryFilterControl(field);
  }

  const value = productFilters[field.key] || "";
  const inputType = getProductFilterInputType(field);
  const placeholderAttr =
    inputType === "date"
      ? ""
      : `placeholder="${escapeHtml(getProductFilterPlaceholder(field))}"`;
  return `
    <input
      id="product-filter-${escapeHtml(field.key)}"
      class="manage-table-filter"
      type="${inputType}"
      data-filter-key="${escapeHtml(field.key)}"
      value="${escapeHtml(value)}"
      ${placeholderAttr}
      aria-label="${escapeHtml(`Filter by ${field.label.toLowerCase()}`)}"
    />
  `;
}

function renderProductCategoryFilterControl(field) {
  const selectedValues = Array.isArray(productFilters[field.key]) ? productFilters[field.key] : [];
  const options = getUniqueProductCategoryOptions();
  const summaryText = getProductCategoryFilterSummary(selectedValues);

  return `
    <details
      id="product-filter-${escapeHtml(field.key)}"
      class="manage-filter-dropdown"
      data-filter-dropdown="${escapeHtml(field.key)}"
    >
      <summary
        class="manage-table-filter manage-filter-dropdown-trigger"
        aria-label="${escapeHtml(`Filter by ${field.label.toLowerCase()}`)}"
      >
        <span class="manage-filter-dropdown-summary">${escapeHtml(summaryText)}</span>
      </summary>
      <div class="manage-filter-dropdown-menu" role="group" aria-label="${escapeHtml(field.label)}">
        ${options
          .map((option, index) => {
            const isSelected = selectedValues.includes(option);
            const optionId = `product-filter-${field.key}-${index}`;
            return `
              <label class="manage-filter-option" for="${escapeHtml(optionId)}">
                <input
                  id="${escapeHtml(optionId)}"
                  type="checkbox"
                  data-filter-key="${escapeHtml(field.key)}"
                  value="${escapeHtml(option)}"
                  ${isSelected ? "checked" : ""}
                />
                <span>${escapeHtml(option)}</span>
              </label>
            `;
          })
          .join("")}
      </div>
    </details>
  `;
}

function getProductFilterInputType(field) {
  return field.key === "created_at" ? "date" : "text";
}

function getProductFilterPlaceholder(field) {
  if (field.key === "created_at") return "Search date";
  return `Filter ${field.label.toLowerCase()}`;
}

function handleProductFilterChange(event) {
  const key = event.target && event.target.dataset ? event.target.dataset.filterKey : "";
  if (!key) return;
  productFilters[key] = getProductFilterControlValue(event.target, key);
  syncProductFilterControlState(key);
  currentProductPage = 1;
  scheduleFilteredProductsRender();
}

function clearProductFilters() {
  productFilters = {};
  currentProductPage = 1;
  clearScheduledProductFilterRender();

  const thead = document.getElementById("products-table-head");
  if (thead) {
    thead.querySelectorAll("[data-filter-key]").forEach((control) => {
      clearProductFilterControl(control);
    });
  }

  syncProductFilterControlState("category");
  renderFilteredProducts();
}

function renderFilteredProducts() {
  const tbody = document.getElementById("products-table-body");
  if (!tbody) return;
  const tableFields = getVisibleTableFields();
  const filteredProducts = getFilteredProducts(tableFields);
  renderTableBody(tbody, tableFields, filteredProducts);
}

function changeProductPage(step) {
  const tableFields = getVisibleTableFields();
  const filteredProducts = getFilteredProducts(tableFields);
  const pagination = getProductPagination(filteredProducts);
  const nextPage = pagination.page + step;

  if (nextPage < 1 || nextPage > pagination.totalPages) return;

  currentProductPage = nextPage;
  renderFilteredProducts();
}

function scheduleFilteredProductsRender() {
  clearScheduledProductFilterRender();
  productFilterDebounceTimer = window.setTimeout(() => {
    productFilterDebounceTimer = null;
    renderFilteredProducts();
  }, PRODUCT_FILTER_DEBOUNCE_MS);
}

function clearScheduledProductFilterRender() {
  if (productFilterDebounceTimer === null) return;
  window.clearTimeout(productFilterDebounceTimer);
  productFilterDebounceTimer = null;
}

function getProductPagination(items) {
  const totalPages = Math.max(1, Math.ceil(items.length / PRODUCT_PAGE_SIZE));
  currentProductPage = Math.min(Math.max(currentProductPage, 1), totalPages);

  const startIndex = (currentProductPage - 1) * PRODUCT_PAGE_SIZE;
  const endIndex = Math.min(startIndex + PRODUCT_PAGE_SIZE, items.length);

  return {
    items: items.slice(startIndex, endIndex),
    page: currentProductPage,
    startIndex,
    endIndex,
    totalPages,
  };
}

function getFilteredProducts(tableFields) {
  return products.filter((product) => matchesProductFilters(product, tableFields));
}

function matchesProductFilters(product, tableFields) {
  return tableFields.every((field) => {
    if (field.key === PRODUCT_IMAGE_COLUMN.key) return true;

    const rawFilterValue = productFilters[field.key];
    if (field.key === "category") {
      return matchesProductCategoryFilter(product && product.category, rawFilterValue);
    }

    const filterValue = normalizeFilterValue(rawFilterValue);
    if (!filterValue) return true;

    if (field.key === "created_at") {
      return matchesProductDateFilter(product && product.created_at, rawFilterValue);
    }

    const values = [];
    if (product && product[field.key] != null) {
      values.push(String(product[field.key]));
    }

    return values.some((value) => normalizeFilterValue(value).includes(filterValue));
  });
}

function matchesProductCategoryFilter(value, filterValues) {
  if (!Array.isArray(filterValues) || filterValues.length === 0) return true;
  return filterValues.includes(String(value == null ? "" : value));
}

function matchesProductDateFilter(value, filterValue) {
  if (!filterValue) return true;

  const productDate = getProductFilterDateValue(value);
  if (!productDate) return false;

  return productDate === filterValue;
}

function getProductFilterDateValue(value) {
  if (value === undefined || value === null || value === "") return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function hasActiveProductFilters() {
  return Object.values(productFilters).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    return normalizeFilterValue(value);
  });
}

function getProductFilterControlValue(control, key) {
  if (!control) return "";

  if (key === "category") {
    return getSelectedProductCategoryValues();
  }

  if (control instanceof HTMLSelectElement && control.multiple) {
    return Array.from(control.selectedOptions).map((option) => option.value);
  }

  return control.value;
}

function clearProductFilterControl(control) {
  if (!control) return;

  if (control instanceof HTMLInputElement && control.type === "checkbox") {
    control.checked = false;
    return;
  }

  if (control instanceof HTMLSelectElement && control.multiple) {
    Array.from(control.options).forEach((option) => {
      option.selected = false;
    });
    return;
  }

  control.value = "";
}

function getUniqueProductCategoryOptions() {
  return Array.from(
    new Set(
      products
        .map((product) => String(product && product.category != null ? product.category : "").trim())
        .filter(Boolean),
    ),
  ).sort((left, right) => left.localeCompare(right, "en-GB", { sensitivity: "base" }));
}

function getSelectedProductCategoryValues() {
  const thead = document.getElementById("products-table-head");
  if (!thead) return [];

  return Array.from(
    thead.querySelectorAll('input[data-filter-key="category"]:checked'),
    (control) => control.value,
  );
}

function getProductCategoryFilterSummary(selectedValues) {
  if (!Array.isArray(selectedValues) || selectedValues.length === 0) {
    return "Select categories";
  }

  if (selectedValues.length === 1) {
    return selectedValues[0];
  }

  return `${selectedValues.length} categories selected`;
}

function syncProductFilterControlState(key) {
  if (key !== "category") return;

  const summary = document.querySelector(
    '[data-filter-dropdown="category"] .manage-filter-dropdown-summary',
  );
  if (!summary) return;

  summary.textContent = getProductCategoryFilterSummary(
    Array.isArray(productFilters.category) ? productFilters.category : [],
  );
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

function renderManageActionButton(action, label) {
  const className = action === "delete" ? "danger-button" : "text-button";
  const icon = action === "delete" ? getTrashIconMarkup() : getPencilIconMarkup();

  return `
    <button
      class="${className} manage-action-button"
      type="button"
      data-action="${escapeHtml(action)}"
      aria-label="${escapeHtml(label)}"
      title="${escapeHtml(label)}"
    >
      ${icon}
    </button>
  `;
}

function getPencilIconMarkup() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 20h9"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      />
      <path
        d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      />
    </svg>
  `;
}

function getTrashIconMarkup() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M3 6h18"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      />
      <path
        d="M8 6V4h8v2"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      />
      <path
        d="M19 6l-1 14H6L5 6"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      />
      <path
        d="M10 11v6M14 11v6"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      />
    </svg>
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
      day: "2-digit",
      month: "2-digit",
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
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function renderPagination(filteredCount, pagination) {
  const previousButton = document.getElementById("previous-page-button");
  const nextButton = document.getElementById("next-page-button");
  const status = document.getElementById("pagination-status");
  const totalPages = pagination && pagination.totalPages ? pagination.totalPages : 1;
  const page = pagination && pagination.page ? pagination.page : 1;
  const start = pagination && filteredCount > 0 ? pagination.startIndex + 1 : 0;
  const end = pagination ? pagination.endIndex : 0;

  if (previousButton) {
    previousButton.hidden = filteredCount <= PRODUCT_PAGE_SIZE;
    previousButton.disabled = page <= 1;
  }
  if (nextButton) {
    nextButton.hidden = filteredCount <= PRODUCT_PAGE_SIZE;
    nextButton.disabled = page >= totalPages;
  }

  if (status) {
    if (products.length === 0) {
      status.textContent = "No products to display";
    } else if (filteredCount === 0) {
      status.textContent = hasActiveProductFilters()
        ? "Showing 0 filtered products"
        : "No products to display";
    } else if (hasActiveProductFilters()) {
      status.textContent =
        totalPages > 1
          ? `Showing ${start}-${end} of ${filteredCount} filtered products (${totalProducts} total)`
          : `Showing ${filteredCount} filtered products of ${totalProducts} total`;
    } else if (totalProductsKnown) {
      status.textContent =
        totalPages > 1
          ? `Showing ${start}-${end} of ${totalProducts} products`
          : `Showing ${totalProducts} products`;
    } else {
      status.textContent =
        totalPages > 1
          ? `Showing ${start}-${end} of ${products.length} products`
          : `Showing ${products.length} products`;
    }
  }
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
  resetTurnstile("#product-form-turnstile");
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
    const body = editingId
      ? {
          subMethodType: "PUT",
          record: Object.assign({ id: editingId }, record),
          cf_turnstile_response: getTurnstileToken(event.currentTarget),
        }
      : {
          record: record,
          cf_turnstile_response: getTurnstileToken(event.currentTarget),
        };

    await manageApiPost(PRODUCT_LIST_PATH, body, session);
    closeForm();
    await loadProducts();
    setStatus(document.getElementById("status-banner"), "Product saved.", "success");
  } catch (error) {
    setStatus(statusBanner, error.message || "Unable to save product.", "error");
    resetTurnstile("#product-form-turnstile");
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}

function handleDelete(product) {
  deleteTargetProduct = product || null;

  const modal = document.getElementById("product-delete-modal");
  const message = document.getElementById("product-delete-modal-message");
  if (message) {
    message.textContent = `Are you sure you want to delete ${getProductDeleteLabel(
      product,
    )}? This action cannot be undone.`;
  }

  setStatus(document.getElementById("product-delete-status-banner"), "", "info");
  setDeletePendingState(false);
  showModal(modal);
  resetTurnstile("#product-delete-turnstile");
}

async function handleDeleteConfirm() {
  if (!deleteTargetProduct || isDeletePending) return;

  const statusBanner = document.getElementById("status-banner");
  const modalStatusBanner = document.getElementById("product-delete-status-banner");
  setStatus(modalStatusBanner, "", "info");
  setDeletePendingState(true);

  try {
    await manageApiPost(
      PRODUCT_LIST_PATH,
      {
        subMethodType: "DELETE",
        id: deleteTargetProduct.id,
        cf_turnstile_response: getTurnstileToken(
          document.getElementById("product-delete-modal"),
        ),
      },
      session,
    );
    setDeletePendingState(false);
    closeModal(document.getElementById("product-delete-modal"));
    await loadProducts();
    setStatus(statusBanner, "Product deleted.", "success");
  } catch (error) {
    setStatus(modalStatusBanner, error.message || "Unable to delete product.", "error");
    setStatus(statusBanner, error.message || "Unable to delete product.", "error");
    resetTurnstile("#product-delete-turnstile");
  } finally {
    setDeletePendingState(false);
  }
}

function getEditableProductFields() {
  return productFields.filter((field) => !HIDDEN_PRODUCT_FORM_KEYS.has(field.key));
}

function getProductDeleteLabel(product) {
  const label = product && (product.name || product.sku || product.id);
  return `"${label || "this product"}"`;
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
  if (modal.id === "product-delete-modal" && isDeletePending) return;
  modal.hidden = true;

  if (modal.id === "product-modal") {
    editingId = null;
  }

  if (modal.id === "product-delete-modal") {
    deleteTargetProduct = null;
    setDeletePendingState(false);
    setStatus(document.getElementById("product-delete-status-banner"), "", "info");
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

function normalizeFilterValue(value) {
  return String(value == null ? "" : value).trim().toLowerCase();
}

function setDeletePendingState(isPending) {
  isDeletePending = Boolean(isPending);

  const modal = document.getElementById("product-delete-modal");
  const confirmButton = document.getElementById("product-delete-confirm-button");
  if (confirmButton) {
    confirmButton.disabled = isDeletePending;
    confirmButton.textContent = isDeletePending ? "Deleting..." : "Delete product";
  }

  if (!modal) return;

  modal.setAttribute("aria-busy", isDeletePending ? "true" : "false");
  modal.querySelectorAll("[data-close-modal]").forEach((control) => {
    if ("disabled" in control) {
      control.disabled = isDeletePending;
    }
  });
}
