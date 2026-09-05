const ORGANISATION_PATH = "/organisation";
const ORGANISATION_FIELDS = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "contact_type", label: "Contact Type", type: "text", disabled: true },
  { key: "email", label: "Email", type: "email" },
  { key: "first_name", label: "First Name", type: "text" },
  { key: "last_name", label: "Last Name", type: "text" },
  { key: "phone", label: "Phone", type: "tel" },
  { key: "address_1", label: "Address 1", type: "textarea" },
  { key: "address_2", label: "Address 2", type: "textarea" },
  { key: "postcode", label: "Postcode", type: "text" },
  { key: "county", label: "County", type: "text" },
  { key: "country", label: "Country", type: "text" },
  {
    key: "custom_1",
    label: "Custom Fields 1",
    type: "custom-fields",
  },
  {
    key: "custom_2",
    label: "Custom Fields 2",
    type: "custom-fields",
  },
];

let session = null;
let organisationId = null;

document.addEventListener("DOMContentLoaded", () => {
  session = requireManageSession("./login.html");
  if (!session) return;

  renderFormFields();
  wirePage();
  loadOrganisation();
});

function wirePage() {
  document.getElementById("logout-button")?.addEventListener("click", () => {
    manageLogout("./login.html");
  });
  document.getElementById("refresh-organisation-button")?.addEventListener("click", () => {
    loadOrganisation(true);
  });
  document.getElementById("organisation-form")?.addEventListener("submit", handleSubmit);
  document.getElementById("organisation-form-fields")?.addEventListener("click", handleCustomFieldClick);

  const accountEmail = document.getElementById("account-email");
  if (accountEmail) accountEmail.textContent = session.email || "staff member";
}

function renderFormFields() {
  const container = document.getElementById("organisation-form-fields");
  if (!container) return;
  container.innerHTML = ORGANISATION_FIELDS.map(renderFieldMarkup).join("");
}

function renderFieldMarkup(field) {
  const id = `organisation-field-${field.key}`;
  const required = field.required ? "required" : "";
  const requiredMark = field.required ? '<span class="required">*</span>' : "";
  const readOnly = field.readOnly ? "readonly" : "";
  const disabled = field.disabled ? "disabled" : "";
  const placeholder = field.placeholder ? ` placeholder="${escapeHtml(field.placeholder)}"` : "";

  if (field.type === "custom-fields") {
    return `
      <div class="field manage-custom-fields" data-custom-fields="${field.key}">
        <label>${field.label}</label>
        <table class="manage-custom-fields-table">
          <thead><tr><th scope="col">Item</th><th scope="col">Value</th><th aria-label="Actions"></th></tr></thead>
          <tbody id="organisation-field-${field.key}-rows"></tbody>
        </table>
        <button class="secondary-button manage-custom-fields-add" type="button" data-add-custom-field="${field.key}">Add item</button>
      </div>
    `;
  }

  if (field.type === "textarea") {
    return `<div class="field"><label for="${id}">${field.label} ${requiredMark}</label><textarea id="${id}" name="${field.key}" rows="4" ${required}${readOnly}${disabled}${placeholder}></textarea></div>`;
  }

  return `<div class="field"><label for="${id}">${field.label} ${requiredMark}</label><input id="${id}" name="${field.key}" type="${field.type}" ${required}${readOnly}${disabled}${placeholder} /></div>`;
}

async function loadOrganisation(showSuccessMessage = false) {
  const statusBanner = document.getElementById("status-banner");
  setStatus(statusBanner, "", "info");
  setLoading(true);

  try {
    const result = await manageApiGet(ORGANISATION_PATH);
    const organisation = extractApiRecord(result);
    populateForm(organisation);
    renderOrganisationRefreshTimestamp(new Date());
    if (showSuccessMessage) setStatus(statusBanner, "Organisation details refreshed.", "success");
  } catch (error) {
    setStatus(statusBanner, error.message || "Unable to load organisation details.", "error");
  } finally {
    setLoading(false);
  }
}

function populateForm(organisation) {
  organisationId = organisation?.id || null;

  ORGANISATION_FIELDS.forEach((field) => {
    const input = document.getElementById(`organisation-field-${field.key}`);
    if (field.type === "custom-fields") {
      setCustomFieldRows(field.key, organisation?.[field.key]);
      return;
    }
    if (input) input.value = organisation?.[field.key] == null ? "" : String(organisation[field.key]);
  });
}

async function handleSubmit(event) {
  event.preventDefault();
  const statusBanner = document.getElementById("status-banner");
  setStatus(statusBanner, "", "info");

  const record = {};
  for (const field of ORGANISATION_FIELDS) {
    if (field.readOnly || field.disabled) continue;
    try {
      record[field.key] =
        field.type === "custom-fields"
          ? getCustomFieldsValue(field)
          : document.getElementById(`organisation-field-${field.key}`)?.value.trim() || "";
    } catch (_error) {
      setStatus(statusBanner, _error.message, "error");
      return;
    }
  }

  if (!record.name) {
    setStatus(statusBanner, "Name is required.", "error");
    return;
  }

  const submitButton = document.getElementById("organisation-submit-button");
  if (submitButton) submitButton.disabled = true;

  try {
    const id = organisationId || generateOrganisationId();
    await manageApiPost(
      ORGANISATION_PATH,
      {
        subMethodType: organisationId ? "PUT" : undefined,
        record: Object.assign({ id }, record),
        cf_turnstile_response: getTurnstileToken(event.currentTarget),
      },
      session,
    );
    organisationId = id;
    setStatus(statusBanner, "Organisation details saved.", "success");
  } catch (error) {
    setStatus(statusBanner, error.message || "Unable to save organisation details.", "error");
    resetTurnstile("#organisation-form-turnstile");
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}

function handleCustomFieldClick(event) {
  const addButton = event.target.closest("[data-add-custom-field]");
  if (addButton) {
    addCustomFieldRow(addButton.dataset.addCustomField);
    return;
  }

  const removeButton = event.target.closest("[data-remove-custom-field]");
  if (removeButton) removeButton.closest("tr")?.remove();
}

function setCustomFieldRows(key, value) {
  const rows = document.getElementById(`organisation-field-${key}-rows`);
  if (!rows) return;
  rows.innerHTML = "";

  const customFields = parseCustomFieldsResponse(value);
  Object.entries(customFields).forEach(([item, fieldValue]) => addCustomFieldRow(key, item, fieldValue));
}

function parseCustomFieldsResponse(value) {
  if (!value) return {};

  const parsed = typeof value === "string" ? tryParseJson(value) : value;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  return parsed;
}

function tryParseJson(value) {
  try {
    return JSON.parse(value);
  } catch (_error) {
    return null;
  }
}

function addCustomFieldRow(key, item = "", value = "") {
  const rows = document.getElementById(`organisation-field-${key}-rows`);
  if (!rows) return;

  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input type="text" class="manage-custom-field-item" placeholder="Item" value="${escapeHtml(item)}" /></td>
    <td><input type="text" class="manage-custom-field-value" placeholder="Value" value="${escapeHtml(value)}" /></td>
    <td><button class="manage-custom-fields-remove" type="button" data-remove-custom-field aria-label="Remove custom field">${renderBinIcon()}</button></td>
  `;
  rows.append(row);
}

function getCustomFieldsValue(field) {
  const rows = document.querySelectorAll(`#organisation-field-${field.key}-rows tr`);
  const values = {};

  for (const row of rows) {
    const item = row.querySelector(".manage-custom-field-item")?.value.trim() || "";
    const value = row.querySelector(".manage-custom-field-value")?.value.trim() || "";
    if (!item && !value) continue;
    if (!item) throw new Error(`${field.label}: every value needs an item.`);
    if (Object.hasOwn(values, item)) throw new Error(`${field.label}: item names must be unique.`);
    values[item] = value;
  }

  return values;
}

function renderBinIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h16M10 11v6M14 11v6M9 7l1-3h4l1 3M6 7l1 13h10l1-13" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" /></svg>`;
}

function generateOrganisationId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  if (!window.crypto?.getRandomValues) throw new Error("Your browser cannot generate a secure organisation ID.");

  const bytes = window.crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function getTurnstileToken(form) {
  return new FormData(form).get("cf-turnstile-response")?.toString() || "";
}

function resetTurnstile(container) {
  if (window.turnstile) window.turnstile.reset(container);
}

function setLoading(isLoading) {
  const loading = document.getElementById("organisation-loading");
  if (loading) loading.hidden = !isLoading;
}

function renderOrganisationRefreshTimestamp(value) {
  const timestamp = document.getElementById("organisation-last-refreshed");
  if (!timestamp) return;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return;

  const formatted = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  timestamp.textContent = `Last refreshed: ${formatted}`;
}

function setStatus(banner, message, state) {
  if (!banner) return;
  banner.hidden = !message;
  banner.textContent = message || "";
  banner.dataset.state = state || "info";
}

function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, (character) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character],
  );
}
