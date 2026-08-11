const BLOG_LIST_PATH = "/blog";
const BLOG_PAGE_SIZE = 50;

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

document.addEventListener("DOMContentLoaded", () => {
  session = requireManageSession("./login.html");
  if (!session) return;

  wireChrome();
  wireForm();
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

  if (posts.length === 0) {
    tbody.innerHTML = '<tr class="manage-empty-row"><td colspan="5">No blog posts yet.</td></tr>';
    return;
  }

  tbody.innerHTML = posts
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
    const post = posts.find((item) => String(item.id) === id);
    if (!post) return;

    if (button.dataset.action === "edit") {
      button.addEventListener("click", () => openForm(post));
    } else {
      button.addEventListener("click", () => handleDelete(post));
    }
  });
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

function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
  );
}
