const BLOG_LIST_PATH = "/blog";
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
  {
    key: "created_at",
    label: "Created",
    filterType: "text",
    placeholder: "Search date",
  },
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
let nextStartRow = 1;
let editingId = null;
let postFilters = getDefaultBlogFilters();

document.addEventListener("DOMContentLoaded", () => {
  session = requireManageSession("./login.html");
  if (!session) return;

  wireChrome();
  wireForm();
  renderTableHead();
  loadPosts(true);
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

  const loadMoreButton = document.getElementById("load-more-button");
  if (loadMoreButton) {
    loadMoreButton.addEventListener("click", () => loadPosts(false));
  }

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", closeForm);
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

function renderTableHead() {
  const thead = document.getElementById("posts-table-head");
  if (!thead) return;

  thead.innerHTML = `
    <tr>
      ${BLOG_TABLE_COLUMNS.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}
      <th>Actions</th>
    </tr>
    <tr class="manage-filter-row">
      ${BLOG_TABLE_COLUMNS.map((column) => `<th>${renderBlogFilterControl(column)}</th>`).join("")}
      <th class="manage-filter-actions-cell">
        <button
          id="clear-post-filters"
          class="secondary-button manage-filter-reset"
          type="button"
        >
          Clear
        </button>
      </th>
    </tr>
  `;

  thead.querySelectorAll("[data-filter-key]").forEach((control) => {
    const eventName = control.tagName === "SELECT" ? "change" : "input";
    control.addEventListener(eventName, handleBlogFilterChange);
  });

  const clearButton = document.getElementById("clear-post-filters");
  if (clearButton) {
    clearButton.addEventListener("click", clearBlogFilters);
  }
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

  return `
    <input
      class="manage-table-filter"
      type="text"
      data-filter-key="${escapeHtml(column.key)}"
      value="${escapeHtml(value)}"
      placeholder="${escapeHtml(column.placeholder || `Filter ${column.label.toLowerCase()}`)}"
      aria-label="${escapeHtml(ariaLabel)}"
    />
  `;
}

function handleBlogFilterChange(event) {
  const key = event.target && event.target.dataset ? event.target.dataset.filterKey : "";
  if (!key) return;
  postFilters[key] = event.target.value.trim();
  renderTable();
}

function clearBlogFilters() {
  postFilters = getDefaultBlogFilters();

  const thead = document.getElementById("posts-table-head");
  if (thead) {
    thead.querySelectorAll("[data-filter-key]").forEach((control) => {
      control.value = "";
    });
  }

  renderTable();
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

  if (field.type === "textarea") {
    return `
      <div class="field">
        <label for="${id}">${field.label} ${requiredMark}</label>
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
    </div>
  `;
}

async function loadPosts(reset) {
  const statusBanner = document.getElementById("status-banner");
  setStatus(statusBanner, "", "info");
  setPostsLoading(true);

  if (reset) {
    posts = [];
    nextStartRow = 1;
  }

  try {
    const startRow = nextStartRow;
    const result = await manageApiGet(BLOG_LIST_PATH, {
      startRow: startRow,
      endRow: startRow + BLOG_PAGE_SIZE - 1,
    });

    const page = extractApiList(result);
    posts = posts.concat(page);
    renderTable();

    const pagination = extractApiPagination(result, startRow, BLOG_PAGE_SIZE, page.length);
    const loadMoreButton = document.getElementById("load-more-button");
    if (loadMoreButton) {
      if (pagination.hasMore) {
        loadMoreButton.hidden = false;
        nextStartRow = pagination.nextStartRow;
      } else {
        loadMoreButton.hidden = true;
      }
    }
  } catch (error) {
    setStatus(statusBanner, error.message || "Unable to load blog posts.", "error");
  } finally {
    setPostsLoading(false);
  }
}

function setPostsLoading(isLoading) {
  const loadingIndicator = document.getElementById("posts-loading");
  const table = document.querySelector(".manage-table");
  const loadMoreButton = document.getElementById("load-more-button");

  if (loadingIndicator) {
    loadingIndicator.hidden = !isLoading;
  }

  if (table) {
    table.hidden = isLoading;
    table.setAttribute("aria-busy", isLoading ? "true" : "false");
  }

  if (loadMoreButton) {
    loadMoreButton.disabled = isLoading;
  }
}

function renderTable() {
  const tbody = document.getElementById("posts-table-body");
  if (!tbody) return;
  const filteredPosts = getFilteredPosts();

  if (filteredPosts.length === 0) {
    tbody.innerHTML = `<tr class="manage-empty-row"><td colspan="5">${
      hasActiveBlogFilters() ? "No blog posts match current filters." : "No blog posts yet."
    }</td></tr>`;
    return;
  }

  tbody.innerHTML = filteredPosts
    .map(
      (post) => `
        <tr data-id="${escapeHtml(post.id)}">
          <td>${escapeHtml(post.title)}</td>
          <td>${escapeHtml(post.status || "—")}</td>
          <td class="cell-muted">${escapeHtml(post.tags || "—")}</td>
          <td class="cell-muted">${formatDate(post.created_at)}</td>
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
    const post = filteredPosts.find((item) => String(item.id) === id);
    if (!post) return;

    if (button.dataset.action === "edit") {
      button.addEventListener("click", () => openForm(post));
    } else {
      button.addEventListener("click", () => handleDelete(post));
    }
  });
}

function getFilteredPosts() {
  return posts.filter((post) => matchesBlogFilters(post));
}

function matchesBlogFilters(post) {
  return BLOG_TABLE_COLUMNS.every((column) => {
    const filterValue = normalizeFilterValue(postFilters[column.key]);
    if (!filterValue) return true;

    if (column.key === "status") {
      return normalizeFilterValue(post && post.status) === filterValue;
    }

    const values = [];
    if (post && post[column.key] != null) {
      values.push(String(post[column.key]));
    }

    if (column.key === "created_at") {
      values.push(formatDate(post && post.created_at));
    }

    return values.some((value) => normalizeFilterValue(value).includes(filterValue));
  });
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

  if (modal) modal.hidden = false;
}

function closeForm() {
  const modal = document.getElementById("post-modal");
  if (modal) modal.hidden = true;
  editingId = null;
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

    const result = await manageApiPost(BLOG_LIST_PATH, body, session);
    const saved = extractApiRecord(result);

    if (editingId) {
      posts = posts.map((post) =>
        String(post.id) === String(editingId) ? saved || post : post,
      );
    } else if (saved) {
      posts = [saved].concat(posts);
    }

    renderTable();
    closeForm();
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
    posts = posts.filter((item) => String(item.id) !== String(post.id));
    renderTable();
    setStatus(statusBanner, "Blog post deleted.", "success");
  } catch (error) {
    setStatus(statusBanner, error.message || "Unable to delete blog post.", "error");
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
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("en-GB");
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
