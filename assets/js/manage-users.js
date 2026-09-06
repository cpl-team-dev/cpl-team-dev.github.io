const USERS_PATH = "/users";
const USER_PROFILE_FIELDS = [
  "email",
  "first_name",
  "last_name",
  "phone",
  "address_1",
  "address_2",
  "postcode",
  "county",
  "country",
];

let usersSession = null;
let usersIsAdmin = false;
let users = [];
let ownUser = null;
let editingUser = null;
let deleteTargetUser = null;
let userFormPending = false;
let userDeletePending = false;
let lastFocusedElement = null;

function getUsersTurnstileToken(container) {
  if (!container) return "";
  if (container instanceof HTMLFormElement) {
    return new FormData(container).get("cf-turnstile-response")?.toString() || "";
  }

  const input = container.querySelector('[name="cf-turnstile-response"]');
  return input ? input.value?.toString() || "" : "";
}

function resetUsersTurnstile(container) {
  if (window.turnstile) window.turnstile.reset(container);
}

document.addEventListener("DOMContentLoaded", () => {
  usersSession = requireManageSession("./login.html", ["admin", "member"]);
  if (!usersSession) return;

  usersIsAdmin = getManageAccountType(usersSession) === "admin";
  wireUsersPage();
  applyUsersRoleView();
  loadUsers();
});

function wireUsersPage() {
  document.getElementById("logout-button")?.addEventListener("click", () => {
    manageLogout("./login.html");
  });
  document.getElementById("refresh-users-button")?.addEventListener("click", () => {
    loadUsers(true);
  });
  document.getElementById("edit-profile-button")?.addEventListener("click", () => {
    if (ownUser) openUserForm(ownUser);
  });
  document.getElementById("user-form")?.addEventListener("submit", handleUserSubmit);
  document.getElementById("user-delete-confirm-button")?.addEventListener("click", handleUserDeleteConfirm);
  document.getElementById("users-table-body")?.addEventListener("click", handleUserTableClick);

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      const modal = button.closest(".manage-modal");
      if (modal) closeUserModal(modal);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const openModal = document.querySelector(".manage-modal:not([hidden])");
    if (openModal) closeUserModal(openModal);
  });
}

function applyUsersRoleView() {
  const email = usersSession.email || "account";
  const role = usersIsAdmin ? "Administrator" : "Member";
  const accountEmail = document.getElementById("account-email");
  const accountRole = document.getElementById("account-role");
  const accountAvatar = document.getElementById("account-avatar");
  if (accountEmail) accountEmail.textContent = email;
  if (accountRole) accountRole.textContent = role;
  if (accountAvatar) accountAvatar.textContent = getUserInitials(usersSession);

  const pageTitle = document.getElementById("users-page-title");
  const pageIntro = document.getElementById("users-page-intro");
  const memberPanel = document.getElementById("member-profile-panel");
  const adminPanel = document.getElementById("admin-users-panel");

  if (pageTitle) pageTitle.textContent = usersIsAdmin ? "Users" : "Your profile";
  if (pageIntro) {
    pageIntro.textContent = usersIsAdmin
      ? "View and manage the people who can access this organisation."
      : "View and update the contact details held for your membership.";
  }
  if (memberPanel) memberPanel.hidden = usersIsAdmin;
  if (adminPanel) adminPanel.hidden = !usersIsAdmin;
}

async function loadUsers(showSuccessMessage = false) {
  const statusBanner = document.getElementById("status-banner");
  setUsersStatus(statusBanner, "", "info");
  setUsersLoading(true);

  try {
    const result = await manageApiGet(USERS_PATH, undefined, usersSession);

    if (usersIsAdmin) {
      users = extractApiList(result);
      renderUsersTable();
    } else {
      ownUser = extractApiRecord(result);
      if (!ownUser) throw new Error("Your profile was not returned by the service.");
      renderOwnUser();
    }

    renderUsersRefreshTimestamp(new Date());
    if (showSuccessMessage) {
      setUsersStatus(
        statusBanner,
        usersIsAdmin ? "User accounts refreshed." : "Your profile was refreshed.",
        "success",
      );
    }
  } catch (error) {
    setUsersStatus(statusBanner, getUsersErrorMessage(error, "Unable to load user details."), "error");
  } finally {
    setUsersLoading(false);
  }
}

function renderOwnUser() {
  const container = document.getElementById("member-profile-details");
  if (!container || !ownUser) return;

  const address = [
    ownUser.address_1,
    ownUser.address_2,
    ownUser.postcode,
    ownUser.county,
    ownUser.country,
  ]
    .filter(Boolean)
    .join(", ");
  const name = getUserName(ownUser);
  const details = [
    ["Name", name],
    ["Email", ownUser.email],
    ["Phone", ownUser.phone],
    ["Address", address],
    ["Account type", formatUserRole(ownUser.user_type)],
    ["Member since", formatUserDate(ownUser.created_at)],
  ];

  container.innerHTML = details
    .map(
      ([label, value]) => `
        <div class="manage-user-detail">
          <dt>${escapeUsersHtml(label)}</dt>
          <dd class="${value ? "" : "cell-muted"}">${escapeUsersHtml(value || "Not provided")}</dd>
        </div>
      `,
    )
    .join("");

  updateUsersAccountChrome(ownUser);
}

function renderUsersTable() {
  const tableBody = document.getElementById("users-table-body");
  const count = document.getElementById("users-count");
  if (count) count.textContent = `${users.length} ${users.length === 1 ? "user" : "users"}`;
  if (!tableBody) return;

  if (users.length === 0) {
    tableBody.innerHTML = '<tr class="manage-empty-row"><td colspan="6">No users were returned for this organisation.</td></tr>';
    return;
  }

  tableBody.innerHTML = users
    .map((user) => {
      const name = getUserName(user);
      const isCurrentUser = sameUserEmail(user.email, usersSession.email);
      const role = String(user.user_type || "member").toLowerCase();
      const canDelete = role === "member";

      return `
        <tr>
          <td>
            <strong>${escapeUsersHtml(name || "Name not provided")}</strong>
            ${isCurrentUser ? '<span class="manage-you-label">You</span>' : ""}
          </td>
          <td>${escapeUsersHtml(user.email || "—")}</td>
          <td><span class="manage-role-badge" data-role="${escapeUsersHtml(role)}">${escapeUsersHtml(formatUserRole(role))}</span></td>
          <td class="${user.phone ? "" : "cell-muted"}">${escapeUsersHtml(user.phone || "Not provided")}</td>
          <td>${escapeUsersHtml(formatUserDate(user.created_at))}</td>
          <td class="row-actions">
            <button class="secondary-button manage-user-action" type="button" data-edit-user="${escapeUsersHtml(user.id || "")}">Edit</button>
            ${canDelete ? `<button class="danger-button manage-user-action" type="button" data-delete-user="${escapeUsersHtml(user.id || "")}">Delete</button>` : ""}
          </td>
        </tr>
      `;
    })
    .join("");
}

function handleUserTableClick(event) {
  const editButton = event.target.closest("[data-edit-user]");
  if (editButton) {
    const user = users.find((item) => String(item.id) === editButton.dataset.editUser);
    if (user) openUserForm(user);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-user]");
  if (deleteButton) {
    const user = users.find((item) => String(item.id) === deleteButton.dataset.deleteUser);
    if (user) openUserDelete(user);
  }
}

function openUserForm(user) {
  if (!user || !user.id) return;
  editingUser = user;
  const modal = document.getElementById("user-modal");
  const title = document.getElementById("user-modal-title");
  const subtitle = document.getElementById("user-modal-subtitle");
  const roleField = document.getElementById("user-role-field");

  if (title) title.textContent = usersIsAdmin ? "Edit user" : "Edit your profile";
  if (subtitle) subtitle.textContent = usersIsAdmin ? user.email || "" : "Update your contact details below.";
  if (roleField) roleField.hidden = !usersIsAdmin;

  USER_PROFILE_FIELDS.forEach((key) => {
    const input = document.getElementById(`user-field-${key}`);
    if (input) input.value = user[key] == null ? "" : String(user[key]);
  });

  const roleInput = document.getElementById("user-field-user_type");
  if (roleInput) roleInput.value = String(user.user_type || "member").toLowerCase();
  const customInput = document.getElementById("user-field-custom");
  if (customInput) customInput.value = formatUserCustomValue(user.custom);

  setUsersStatus(document.getElementById("user-form-status-banner"), "", "info");
  setUserFormPending(false);
  showUserModal(modal);
  resetUsersTurnstile("#user-form-turnstile");
  window.setTimeout(() => document.getElementById("user-field-first_name")?.focus(), 0);
}

async function handleUserSubmit(event) {
  event.preventDefault();
  if (!editingUser || userFormPending) return;

  const form = event.currentTarget;
  const statusBanner = document.getElementById("user-form-status-banner");
  const emailInput = document.getElementById("user-field-email");
  setUsersStatus(statusBanner, "", "info");

  if (!emailInput?.value.trim() || !emailInput.checkValidity()) {
    setUsersStatus(statusBanner, "Enter a valid email address.", "error");
    emailInput?.focus();
    return;
  }

  const record = { id: editingUser.id };
  USER_PROFILE_FIELDS.forEach((key) => {
    const input = document.getElementById(`user-field-${key}`);
    record[key] = input?.value.trim() || "";
  });
  record.email = record.email.toLowerCase();

  if (usersIsAdmin) {
    record.user_type = document.getElementById("user-field-user_type")?.value || "member";
  }

  const customValue = document.getElementById("user-field-custom")?.value.trim() || "";
  if (customValue) {
    try {
      const parsedCustom = JSON.parse(customValue);
      if (!parsedCustom || typeof parsedCustom !== "object" || Array.isArray(parsedCustom)) {
        throw new Error("Additional data must be a JSON object.");
      }
      record.custom = parsedCustom;
    } catch (error) {
      setUsersStatus(
        statusBanner,
        error instanceof SyntaxError ? "Additional data is not valid JSON." : error.message,
        "error",
      );
      document.getElementById("user-field-custom")?.focus();
      return;
    }
  } else {
    record.custom = "";
  }

  const editingCurrentUser = sameUserEmail(editingUser.email, usersSession.email);
  setUserFormPending(true);

  try {
    const result = await manageApiPost(
      USERS_PATH,
      {
        subMethodType: "PUT",
        record: record,
        cf_turnstile_response: getUsersTurnstileToken(form),
      },
      usersSession,
    );
    const updatedUser = extractApiRecord(result) || Object.assign({}, editingUser, record);

    if (editingCurrentUser) {
      usersSession.email = updatedUser.email || record.email;
      usersSession.user_type = updatedUser.user_type || record.user_type || usersSession.user_type;
      setManageSession(usersSession);
    }

    closeUserModal(document.getElementById("user-modal"), true);

    if (editingCurrentUser && getManageAccountType(usersSession) !== (usersIsAdmin ? "admin" : "member")) {
      window.location.reload();
      return;
    }

    await loadUsers();
    updateUsersAccountChrome(updatedUser);
    setUsersStatus(document.getElementById("status-banner"), "User details saved.", "success");
  } catch (error) {
    setUsersStatus(statusBanner, getUsersErrorMessage(error, "Unable to save user details."), "error");
    resetUsersTurnstile("#user-form-turnstile");
  } finally {
    setUserFormPending(false);
  }
}

function openUserDelete(user) {
  if (!usersIsAdmin || !user || String(user.user_type).toLowerCase() !== "member") return;
  deleteTargetUser = user;

  const name = getUserName(user) || user.email || "this member";
  const message = document.getElementById("user-delete-modal-message");
  if (message) message.textContent = `Delete ${name} (${user.email || "no email address"})?`;

  setUsersStatus(document.getElementById("user-delete-status-banner"), "", "info");
  setUserDeletePending(false);
  showUserModal(document.getElementById("user-delete-modal"));
  resetUsersTurnstile("#user-delete-turnstile");
  window.setTimeout(() => document.getElementById("user-delete-confirm-button")?.focus(), 0);
}

async function handleUserDeleteConfirm() {
  if (!deleteTargetUser || userDeletePending) return;

  const modalStatus = document.getElementById("user-delete-status-banner");
  setUsersStatus(modalStatus, "", "info");
  setUserDeletePending(true);

  try {
    await manageApiPost(
      USERS_PATH,
      {
        subMethodType: "DELETE",
        id: deleteTargetUser.id,
        cf_turnstile_response: getUsersTurnstileToken(document.getElementById("user-delete-modal")),
      },
      usersSession,
    );

    closeUserModal(document.getElementById("user-delete-modal"), true);
    await loadUsers();
    setUsersStatus(document.getElementById("status-banner"), "Member account deleted.", "success");
  } catch (error) {
    setUsersStatus(modalStatus, getUsersErrorMessage(error, "Unable to delete this member."), "error");
    resetUsersTurnstile("#user-delete-turnstile");
  } finally {
    setUserDeletePending(false);
  }
}

function showUserModal(modal) {
  if (!modal) return;
  lastFocusedElement = document.activeElement;
  modal.hidden = false;
  document.body.classList.add("manage-modal-open");
}

function closeUserModal(modal, force = false) {
  if (!modal) return;
  if (!force && ((modal.id === "user-modal" && userFormPending) || (modal.id === "user-delete-modal" && userDeletePending))) return;

  modal.hidden = true;
  if (!document.querySelector(".manage-modal:not([hidden])")) {
    document.body.classList.remove("manage-modal-open");
  }

  if (modal.id === "user-modal") {
    editingUser = null;
    setUsersStatus(document.getElementById("user-form-status-banner"), "", "info");
  } else if (modal.id === "user-delete-modal") {
    deleteTargetUser = null;
    setUsersStatus(document.getElementById("user-delete-status-banner"), "", "info");
  }

  if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  lastFocusedElement = null;
}

function setUserFormPending(isPending) {
  userFormPending = isPending;
  const button = document.getElementById("user-submit-button");
  if (button) {
    button.disabled = isPending;
    button.textContent = isPending ? "Saving…" : "Save changes";
  }
}

function setUserDeletePending(isPending) {
  userDeletePending = isPending;
  const button = document.getElementById("user-delete-confirm-button");
  if (button) {
    button.disabled = isPending;
    button.textContent = isPending ? "Deleting…" : "Delete member";
  }
}

function setUsersLoading(isLoading) {
  const loading = document.getElementById("users-loading");
  const refreshButton = document.getElementById("refresh-users-button");
  if (loading) loading.hidden = !isLoading;
  if (refreshButton) refreshButton.disabled = isLoading;
}

function setUsersStatus(banner, message, state) {
  if (!banner) return;
  banner.hidden = !message;
  banner.textContent = message || "";
  banner.dataset.state = state || "info";
}

function getUsersErrorMessage(error, fallback) {
  const status = Number(error?.status);
  if (status === 400) return "Check the details and try again.";
  if (status === 403) return "Your account does not have permission to do that.";
  if (status === 404) return "The requested user account could not be found.";
  if (status === 409) return "That email address is already used by another account in this organisation.";
  if (status === 502 || status === 503) return "The user service is temporarily unavailable. Please try again shortly.";
  return error?.message || fallback;
}

function updateUsersAccountChrome(user) {
  if (!user) return;
  const accountEmail = document.getElementById("account-email");
  const accountAvatar = document.getElementById("account-avatar");
  if (accountEmail && user.email) accountEmail.textContent = user.email;
  if (accountAvatar) accountAvatar.textContent = getUserInitials(user);
}

function renderUsersRefreshTimestamp(date) {
  const target = document.getElementById("users-last-refreshed");
  if (!target) return;
  target.textContent = `Last refreshed: ${date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function getUserName(user) {
  return [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
}

function getUserInitials(user) {
  const nameInitials = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .map((part) => String(part).trim().charAt(0))
    .join("");
  if (nameInitials) return nameInitials.slice(0, 2).toUpperCase();
  return String(user?.email || "CP").slice(0, 2).toUpperCase();
}

function sameUserEmail(first, second) {
  return String(first || "").trim().toLowerCase() === String(second || "").trim().toLowerCase();
}

function formatUserRole(role) {
  return String(role || "member").toLowerCase() === "admin" ? "Admin" : "Member";
}

function formatUserDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatUserCustomValue(value) {
  if (!value) return "";
  if (typeof value === "object") return JSON.stringify(value, null, 2);

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? JSON.stringify(parsed, null, 2) : String(value);
  } catch (_error) {
    return String(value);
  }
}

function escapeUsersHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
