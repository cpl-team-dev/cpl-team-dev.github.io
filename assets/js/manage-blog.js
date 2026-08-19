const BLOG_LIST_PATH = "/blog";
const BLOG_SESSION_STORAGE_KEY = "manage-blog-cache";
const BLOG_SESSION_STORAGE_REFRESHED_AT_KEY = "manage-blog-cache-refreshed-at";
const BLOG_FILTER_DEBOUNCE_MS = 500;
const BLOG_PAGE_SIZE = 50;
const BLOG_TABLE_COLUMNS = [
  { key: "title", label: "Title", filterType: "text", placeholder: "Filter title" },
  {
    key: "status",
    label: "Status",
    filterType: "select",
    options: ["", "draft", "published"],
  },
  { key: "tags", label: "Tags", filterType: "text", placeholder: "Filter tags" },
  { key: "created_at", label: "Modified At", filterType: "date" },
];

// The blog Apps Script schema is still being iterated on — keep every
// field name in this one array so a rename on the backend only needs
// one edit here instead of a hunt through the rendering/submit code.
const BLOG_FIELDS = [
  { key: "title", label: "Title", type: "text", required: true },
  { key: "exerpt", label: "Excerpt", type: "text" },
  { key: "image_url", label: "Image URL", type: "url" },
  { key: "content", label: "Content", type: "textarea", required: true },
  { key: "status", label: "Status", type: "select", options: ["draft", "published"] },
  { key: "tags", label: "Tags (comma separated)", type: "text" },
];

let session = null;
let posts = [];
let editingId = null;
let currentBlogPage = 1;
let postFilters = getDefaultBlogFilters();
let blogFilterDebounceTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  session = requireManageSession("./login.html");
  if (!session) return;

  wireChrome();
  wireForm();
  renderTableHead();
  restorePostsRefreshTimestamp();

  const cachedPosts = restorePostsFromSessionStorage();
  if (cachedPosts) {
    applyLoadedPosts(cachedPosts);
  } else {
    loadPosts();
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

  const addButton = document.getElementById("add-post-button");
  if (addButton) {
    addButton.addEventListener("click", () => openForm());
  }

  const refreshButton = document.getElementById("refresh-posts-button");
  if (refreshButton) {
    refreshButton.addEventListener("click", handleRefreshPosts);
  }

  const previousButton = document.getElementById("previous-page-button");
  if (previousButton) {
    previousButton.addEventListener("click", () => changeBlogPage(-1));
    previousButton.hidden = true;
    previousButton.disabled = true;
  }

  const nextButton = document.getElementById("next-page-button");
  if (nextButton) {
    nextButton.addEventListener("click", () => changeBlogPage(1));
    nextButton.hidden = true;
    nextButton.disabled = true;
  }

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      const modal = button.closest(".manage-modal");
      if (modal) closeModal(modal);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    document.querySelectorAll(".manage-modal").forEach((modal) => {
      if (!modal.hidden) closeModal(modal);
    });
  });
}

function wireForm() {
  const fieldsContainer = document.getElementById("post-form-fields");
  if (!fieldsContainer) return;

  fieldsContainer.innerHTML = BLOG_FIELDS.map(renderFieldMarkup).join("");

  const form = document.getElementById("post-form");
  if (form) {
    form.addEventListener("submit", handleSubmit);
  }
}

async function loadPosts(options = {}) {
  const { showSuccessMessage = false, resetView = true } = options;
  const statusBanner = document.getElementById("status-banner");
  setStatus(statusBanner, "", "info");
  setPostsLoading(true);

  try {
    const loadedPosts = await fetchPostsFromEndpoint();
    if (resetView) {
      resetBlogListViewState();
      renderTableHead();
    }
    applyLoadedPosts(loadedPosts);

    if (showSuccessMessage) {
      setStatus(statusBanner, "Blog posts refreshed.", "success");
    }
  } catch (error) {
    setStatus(statusBanner, error.message || "Unable to load blog posts.", "error");
  } finally {
    setPostsLoading(false);
  }
}

async function fetchPostsFromEndpoint() {
  const result = await manageApiGet(BLOG_LIST_PATH);
  const loadedPosts = extractApiList(result);
  persistPostsToSessionStorage(loadedPosts);
  return loadedPosts;
}

function applyLoadedPosts(loadedPosts) {
  posts = Array.isArray(loadedPosts) ? loadedPosts : [];
  renderTable();
}

function persistPostsToSessionStorage(loadedPosts) {
  const refreshedAt = new Date().toISOString();

  try {
    window.sessionStorage.setItem(BLOG_SESSION_STORAGE_KEY, JSON.stringify(loadedPosts));
    window.sessionStorage.setItem(BLOG_SESSION_STORAGE_REFRESHED_AT_KEY, refreshedAt);
    renderPostsRefreshTimestamp(refreshedAt);
  } catch (error) {
    console.warn("Unable to write blog cache to sessionStorage.", error);
  }
}

function restorePostsFromSessionStorage() {
  try {
    const cachedPosts = window.sessionStorage.getItem(BLOG_SESSION_STORAGE_KEY);
    if (!cachedPosts) return null;

    const parsedPosts = JSON.parse(cachedPosts);
    return Array.isArray(parsedPosts) ? parsedPosts : null;
  } catch (error) {
    console.warn("Unable to read blog cache from sessionStorage.", error);
    return null;
  }
}

function restorePostsRefreshTimestamp() {
  try {
    const refreshedAt = window.sessionStorage.getItem(BLOG_SESSION_STORAGE_REFRESHED_AT_KEY);
    renderPostsRefreshTimestamp(refreshedAt);
  } catch (error) {
    console.warn("Unable to read blog refresh timestamp from sessionStorage.", error);
  }
}

function renderPostsRefreshTimestamp(value) {
  const timestamp = document.getElementById("posts-last-refreshed");
  if (!timestamp) return;

  timestamp.textContent = `Last refreshed: ${formatPostsRefreshTimestamp(value)}`;
}

function formatPostsRefreshTimestamp(value) {
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

async function handleRefreshPosts() {
  await loadPosts({ showSuccessMessage: true });
}

function resetBlogListViewState() {
  postFilters = getDefaultBlogFilters();
  currentBlogPage = 1;
  clearScheduledBlogFilterRender();
}

function renderTableHead() {
  const thead = document.getElementById("posts-table-head");
  if (!thead) return;

  thead.innerHTML = `
    <tr class="manage-filter-panel-row">
      <th colspan="${BLOG_TABLE_COLUMNS.length + 1}">
        ${renderBlogFilterPanel()}
      </th>
    </tr>
    <tr>
      ${BLOG_TABLE_COLUMNS.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}
      <th>Actions</th>
    </tr>
  `;

  thead.querySelectorAll("[data-filter-key]").forEach((control) => {
    control.addEventListener("input", handleBlogFilterChange);
    control.addEventListener("change", handleBlogFilterChange);
  });

  const clearButton = document.getElementById("clear-post-filters");
  if (clearButton) {
    clearButton.addEventListener("click", clearBlogFilters);
  }
}

function renderBlogFilterPanel() {
  return `
    <div class="manage-products-filter-panel">
      <div class="manage-products-filter-heading">Filters</div>
      <div class="manage-blog-filter-grid">
        ${BLOG_TABLE_COLUMNS.map(
          (column) => `
            <div class="manage-products-filter-field">
              <span class="manage-products-filter-label">${escapeHtml(column.label)}</span>
              ${renderBlogFilterControl(column)}
            </div>
          `,
        ).join("")}
        <div class="manage-products-filter-actions">
          <span class="manage-products-filter-label">Actions</span>
          <button
            id="clear-post-filters"
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

function renderBlogFilterControl(column) {
  const value = postFilters[column.key] || "";
  const ariaLabel = `Filter by ${column.label.toLowerCase()}`;

  if (column.filterType === "select") {
    return `
      <select
        class="manage-table-filter"
        data-filter-key="${escapeHtml(column.key)}"
        aria-label="${escapeHtml(ariaLabel)}"
      >
        ${column.options
          .map((option) => {
            const selected = option === value ? "selected" : "";
            const label = option ? capitalize(option) : "All";
            return `<option value="${escapeHtml(option)}" ${selected}>${escapeHtml(label)}</option>`;
          })
          .join("")}
      </select>
    `;
  }

  const inputType = column.filterType === "date" ? "date" : "text";
  const placeholderAttr =
    inputType === "date"
      ? ""
      : `placeholder="${escapeHtml(column.placeholder || `Filter ${column.label.toLowerCase()}`)}"`;

  return `
    <input
      class="manage-table-filter"
      type="${inputType}"
      data-filter-key="${escapeHtml(column.key)}"
      value="${escapeHtml(value)}"
      ${placeholderAttr}
      aria-label="${escapeHtml(ariaLabel)}"
    />
  `;
}

function handleBlogFilterChange(event) {
  const key = event.target && event.target.dataset ? event.target.dataset.filterKey : "";
  if (!key) return;

  postFilters[key] = event.target.value.trim();
  currentBlogPage = 1;
  scheduleFilteredPostsRender();
}

function clearBlogFilters() {
  postFilters = getDefaultBlogFilters();
  currentBlogPage = 1;
  clearScheduledBlogFilterRender();

  const thead = document.getElementById("posts-table-head");
  if (thead) {
    thead.querySelectorAll("[data-filter-key]").forEach((control) => {
      control.value = "";
    });
  }

  renderFilteredPosts();
}

function getDefaultBlogFilters() {
  return BLOG_TABLE_COLUMNS.reduce((filters, column) => {
    filters[column.key] = "";
    return filters;
  }, {});
}

function renderFieldMarkup(field) {
  const requiredAttr = field.required ? "required" : "";
  const requiredMark = field.required ? '<span class="required">*</span>' : "";
  const id = `post-field-${field.key}`;
  const hintMarkup = getBlogFieldHintMarkup(field);

  if (field.type === "textarea") {
    return `
      <div class="field">
        <label for="${id}">${field.label} ${requiredMark}</label>
        ${hintMarkup}
        <textarea id="${id}" name="${field.key}" ${requiredAttr}></textarea>
      </div>
    `;
  }

  if (field.type === "select") {
    const optionsMarkup = field.options
      .map((option) => `<option value="${option}">${capitalize(option)}</option>`)
      .join("");
    return `
      <div class="field">
        <label for="${id}">${field.label} ${requiredMark}</label>
        <select id="${id}" name="${field.key}">${optionsMarkup}</select>
      </div>
    `;
  }

  return `
    <div class="field">
      <label for="${id}">${field.label} ${requiredMark}</label>
      <input id="${id}" name="${field.key}" type="${field.type}" ${requiredAttr} />
      ${hintMarkup}
    </div>
  `;
}

function getBlogFieldHintMarkup(field) {
  if (!field || field.key !== "content") return "";

  return '<p class="field-hint"><em>To add a link to the text use the format [text](link)</em></p>';
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

function setPostsLoading(isLoading) {
  const loadingIndicator = document.getElementById("posts-loading");
  const table = document.querySelector(".manage-table");
  const previousButton = document.getElementById("previous-page-button");
  const nextButton = document.getElementById("next-page-button");
  const refreshButton = document.getElementById("refresh-posts-button");

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

function renderTable() {
  const tbody = document.getElementById("posts-table-body");
  if (!tbody) return;

  const filteredPosts = getFilteredPosts();
  renderTableBody(tbody, filteredPosts);
}

function renderTableBody(tbody, filteredPosts) {
  const pagination = getBlogPagination(filteredPosts);
  const visiblePosts = pagination.items;

  if (filteredPosts.length === 0) {
    currentBlogPage = 1;
    tbody.innerHTML = `<tr class="manage-empty-row"><td colspan="5">${
      hasActiveBlogFilters() ? "No blog posts match current filters." : "No blog posts yet."
    }</td></tr>`;
    renderPagination(0, pagination);
    return;
  }

  tbody.innerHTML = visiblePosts
    .map(
      (post) => `
        <tr data-id="${escapeHtml(post.id)}">
          <td>${escapeHtml(post.title)}</td>
          <td>${escapeHtml(post.status || "—")}</td>
          <td class="cell-muted">${escapeHtml(post.tags || "—")}</td>
          <td class="cell-muted">${formatDate(post.created_at)}</td>
          <td class="row-actions">
            ${renderManageActionButton("edit", "Edit blog post")}
            ${renderManageActionButton("delete", "Delete blog post")}
          </td>
        </tr>
      `,
    )
    .join("");

  tbody.querySelectorAll("button[data-action]").forEach((button) => {
    const row = button.closest("tr");
    const id = row && row.dataset.id;
    const post = visiblePosts.find((item) => String(item.id) === id);
    if (!post) return;

    if (button.dataset.action === "edit") {
      button.addEventListener("click", () => openForm(post));
    } else {
      button.addEventListener("click", () => handleDelete(post));
    }
  });

  renderPagination(filteredPosts.length, pagination);
}

function renderFilteredPosts() {
  const tbody = document.getElementById("posts-table-body");
  if (!tbody) return;

  const filteredPosts = getFilteredPosts();
  renderTableBody(tbody, filteredPosts);
}

function getBlogPagination(items) {
  const totalPages = Math.max(1, Math.ceil(items.length / BLOG_PAGE_SIZE));
  currentBlogPage = Math.min(Math.max(currentBlogPage, 1), totalPages);

  const startIndex = (currentBlogPage - 1) * BLOG_PAGE_SIZE;
  const endIndex = Math.min(startIndex + BLOG_PAGE_SIZE, items.length);

  return {
    items: items.slice(startIndex, endIndex),
    page: currentBlogPage,
    startIndex,
    endIndex,
    totalPages,
  };
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
    previousButton.hidden = filteredCount <= BLOG_PAGE_SIZE;
    previousButton.disabled = page <= 1;
  }

  if (nextButton) {
    nextButton.hidden = filteredCount <= BLOG_PAGE_SIZE;
    nextButton.disabled = page >= totalPages;
  }

  if (status) {
    if (posts.length === 0) {
      status.textContent = "No blog posts to display";
    } else if (filteredCount === 0) {
      status.textContent = hasActiveBlogFilters()
        ? "Showing 0 filtered blog posts"
        : "No blog posts to display";
    } else if (hasActiveBlogFilters()) {
      status.textContent =
        totalPages > 1
          ? `Showing ${start}-${end} of ${filteredCount} filtered blog posts (${posts.length} total)`
          : `Showing ${filteredCount} filtered blog posts of ${posts.length} total`;
    } else {
      status.textContent =
        totalPages > 1
          ? `Showing ${start}-${end} of ${posts.length} blog posts`
          : `Showing ${posts.length} blog posts`;
    }
  }
}

function changeBlogPage(step) {
  const filteredPosts = getFilteredPosts();
  const pagination = getBlogPagination(filteredPosts);
  const nextPage = pagination.page + step;

  if (nextPage < 1 || nextPage > pagination.totalPages) return;

  currentBlogPage = nextPage;
  renderFilteredPosts();
}

function scheduleFilteredPostsRender() {
  clearScheduledBlogFilterRender();
  blogFilterDebounceTimer = window.setTimeout(() => {
    blogFilterDebounceTimer = null;
    renderFilteredPosts();
  }, BLOG_FILTER_DEBOUNCE_MS);
}

function clearScheduledBlogFilterRender() {
  if (blogFilterDebounceTimer === null) return;
  window.clearTimeout(blogFilterDebounceTimer);
  blogFilterDebounceTimer = null;
}

function getFilteredPosts() {
  return posts.filter((post) => matchesBlogFilters(post));
}

function matchesBlogFilters(post) {
  return BLOG_TABLE_COLUMNS.every((column) => {
    const rawFilterValue = postFilters[column.key];
    const filterValue = normalizeFilterValue(rawFilterValue);
    if (!filterValue) return true;

    if (column.key === "status") {
      return normalizeFilterValue(post && post.status) === filterValue;
    }

    if (column.key === "created_at") {
      return getBlogFilterDateValue(post && post.created_at) === rawFilterValue;
    }

    const values = [];
    if (post && post[column.key] != null) {
      values.push(String(post[column.key]));
    }

    return values.some((value) => normalizeFilterValue(value).includes(filterValue));
  });
}

function getBlogFilterDateValue(value) {
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

function hasActiveBlogFilters() {
  return Object.values(postFilters).some((value) => normalizeFilterValue(value));
}

function openForm(post) {
  editingId = post ? post.id : null;

  const modal = document.getElementById("post-modal");
  const title = document.getElementById("post-modal-title");
  if (title) title.textContent = post ? "Edit blog post" : "Add blog post";

  BLOG_FIELDS.forEach((field) => {
    const input = document.getElementById(`post-field-${field.key}`);
    if (input) input.value = post ? post[field.key] || "" : "";
  });

  setStatus(document.getElementById("form-status-banner"), "", "info");
  showModal(modal);
}

function closeForm() {
  closeModal(document.getElementById("post-modal"));
}

async function handleSubmit(event) {
  event.preventDefault();
  const statusBanner = document.getElementById("form-status-banner");
  setStatus(statusBanner, "", "info");

  const record = {};
  BLOG_FIELDS.forEach((field) => {
    const input = document.getElementById(`post-field-${field.key}`);
    if (input) record[field.key] = input.value.trim();
  });

  if (!record.title || !record.content) {
    setStatus(statusBanner, "Title and content are required.", "error");
    return;
  }

  const submitButton = document.getElementById("post-submit-button");
  if (submitButton) submitButton.disabled = true;

  try {
    const body = editingId
      ? Object.assign({ subMethodType: "PUT", id: editingId }, record)
      : record;

    await manageApiPost(BLOG_LIST_PATH, body, session);
    closeForm();
    await loadPosts({ resetView: false });
    setStatus(document.getElementById("status-banner"), "Blog post saved.", "success");
  } catch (error) {
    setStatus(statusBanner, error.message || "Unable to save blog post.", "error");
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}

async function handleDelete(post) {
  if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;

  const statusBanner = document.getElementById("status-banner");

  try {
    await manageApiPost(BLOG_LIST_PATH, { subMethodType: "DELETE", id: post.id }, session);
    await loadPosts({ resetView: false });
    setStatus(statusBanner, "Blog post deleted.", "success");
  } catch (error) {
    setStatus(statusBanner, error.message || "Unable to delete blog post.", "error");
  }
}

function showModal(modal) {
  if (!modal) return;
  modal.hidden = false;
}

function closeModal(modal) {
  if (!modal) return;
  modal.hidden = true;

  if (modal.id === "post-modal") {
    editingId = null;
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

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function normalizeFilterValue(value) {
  return String(value == null ? "" : value).trim().toLowerCase();
}

function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
  );
}
