function getApiEndpoint(path) {
  const base =
    typeof API_BASE_URL === "string" ? API_BASE_URL.replace(/\/+$/, "") : "";
  return `${base}${path}`;
}

function getOrganisationId() {
  return typeof ORGANISATION_ID === "string" ? ORGANISATION_ID : "";
}

function isManageInterfaceRequest() {
  const pathname =
    window.location && typeof window.location.pathname === "string"
      ? window.location.pathname
      : "";
  return /\/manage(\/|$)/.test(pathname);
}

function handleManageUnauthorizedResponse(response) {
  if (!response || response.status !== 401 || !isManageInterfaceRequest()) {
    return false;
  }

  const expiredSessionMessage = "Your session has expired";

  if (typeof setManageLoginWarning === "function") {
    setManageLoginWarning(expiredSessionMessage);
  }

  if (typeof clearManageSession === "function") {
    clearManageSession();
  }

  window.location.href = "./login.html";
  return true;
}

async function parseManageApiResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const result = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (handleManageUnauthorizedResponse(response)) {
    throw new Error("Your session has expired");
  }

  if (!response.ok || !result || result.ok === false) {
    const message =
      result && typeof result.error === "string" && result.error.trim()
        ? result.error
        : `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return result;
}

async function manageApiGet(path, params, session) {
  const searchParams = new URLSearchParams(
    Object.assign({ organisation_id: getOrganisationId() }, params || {}),
  );

  const activeSession =
    session ||
    (typeof getManageSession === "function" ? getManageSession() : null);
  const authorization =
    typeof getManageAuthorization === "function"
      ? getManageAuthorization(activeSession)
      : "";

  const headers = { Accept: "application/json" };
  if (authorization) headers.Authorization = authorization;

  const response = await fetch(
    `${getApiEndpoint(path)}?${searchParams.toString()}`,
    {
      method: "GET",
      headers: headers,
      cache: "no-store",
    },
  );

  return parseManageApiResponse(response);
}

const TURNSTILE_PENDING_MESSAGE =
  "Please wait for the security check to finish, then try again.";

// Turnstile failures are the only write errors with a specific message; they
// come from the Cloudflare Worker and must match cloudflare-worker/src/index.js
// in mjhub-backend exactly. Every other backend error says "Unable to process
// request.", whatever its status.
const WORKER_TURNSTILE_MISSING_ERROR = "Request body must include Cloudflare validation.";
const WORKER_TURNSTILE_FAILED_ERROR = "Turnstile verification failed.";

// The copy shown to staff is chosen from the HTTP status, except that the
// security-check copy is only used when the Worker says Turnstile failed —
// a 400 or 403 can also be a validation or permission error.
function getManageWriteErrorMessage(error, fallback) {
  const status = error && error.status;
  const message = error && error.message;

  if (error && error.code === "turnstile_missing") return TURNSTILE_PENDING_MESSAGE;
  if (status === 401) return message;
  if (status === 400 && message === WORKER_TURNSTILE_MISSING_ERROR) {
    return "The security check didn't complete. Please wait for it to finish and try again.";
  }
  if (status === 403 && message === WORKER_TURNSTILE_FAILED_ERROR) {
    return "The security check expired or was already used. Please wait for a new one and try again.";
  }

  switch (status) {
    case 400:
      return "Some details couldn't be saved. Please check the form and try again.";
    case 403:
      return "You don't have permission to make this change.";
    case 404:
      return "This item no longer exists. The list has been refreshed.";
    case 409:
      return "An item with these details already exists.";
    case 503:
      return "The server is busy right now. Please try again in a moment.";
    default:
      return fallback;
  }
}

// Writes are never retried automatically — a duplicate write can succeed
// on the first attempt and fail (or double-apply) on the second.
async function manageApiPost(path, body, session) {
  // Last line of defence: an empty Turnstile token is always rejected by
  // the backend, so don't spend a request (or a write lock) on it.
  if (
    body &&
    Object.prototype.hasOwnProperty.call(body, "cf_turnstile_response") &&
    !String(body.cf_turnstile_response || "").trim()
  ) {
    const error = new Error(TURNSTILE_PENDING_MESSAGE);
    error.code = "turnstile_missing";
    throw error;
  }

  const authorization =
    typeof getManageAuthorization === "function"
      ? getManageAuthorization(session)
      : "";

  const response = await fetch(getApiEndpoint(path), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(authorization ? { Authorization: authorization } : {}),
    },
    cache: "no-store",
    body: JSON.stringify(
      Object.assign({ organisation_id: getOrganisationId() }, body || {}),
    ),
  });

  return parseManageApiResponse(response);
}

// The backend's response envelope has shifted while the blog/product
// endpoints are still being built out (records/record today, data
// previously) — read both shapes so a rename on one side doesn't take
// the admin pages down outright.
function extractApiList(result) {
  if (!result) return [];
  if (Array.isArray(result.records)) return result.records;
  if (Array.isArray(result.organisations)) return result.organisations;
  if (Array.isArray(result.organizations)) return result.organizations;
  if (Array.isArray(result.products)) return result.products;
  if (Array.isArray(result.posts)) return result.posts;
  if (Array.isArray(result.blogs)) return result.blogs;
  if (Array.isArray(result.data)) return result.data;
  if (result.data && Array.isArray(result.data.organisations))
    return result.data.organisations;
  if (result.data && Array.isArray(result.data.organizations))
    return result.data.organizations;
  if (result.data && Array.isArray(result.data.products))
    return result.data.products;
  if (result.data && Array.isArray(result.data.posts)) return result.data.posts;
  if (result.data && Array.isArray(result.data.blogs)) return result.data.blogs;
  if (result.data && Array.isArray(result.data.records))
    return result.data.records;
  return [];
}

function extractApiRecord(result) {
  if (!result) return null;
  if (result.record) return result.record;
  if (result.organisation && typeof result.organisation === "object")
    return result.organisation;
  if (result.organization && typeof result.organization === "object")
    return result.organization;
  if (result.product && typeof result.product === "object")
    return result.product;
  if (result.post && typeof result.post === "object") return result.post;
  if (result.blog && typeof result.blog === "object") return result.blog;
  if (
    result.data &&
    result.data.organisation &&
    typeof result.data.organisation === "object"
  ) {
    return result.data.organisation;
  }
  if (
    result.data &&
    result.data.organization &&
    typeof result.data.organization === "object"
  ) {
    return result.data.organization;
  }
  if (
    result.data &&
    result.data.product &&
    typeof result.data.product === "object"
  ) {
    return result.data.product;
  }
  if (result.data && result.data.post && typeof result.data.post === "object") {
    return result.data.post;
  }
  if (result.data && result.data.blog && typeof result.data.blog === "object") {
    return result.data.blog;
  }
  if (
    result.data &&
    typeof result.data === "object" &&
    !Array.isArray(result.data)
  ) {
    return result.data;
  }
  return null;
}

function extractApiPagination(result, startRow, pageSize, pageLength) {
  const pagination = result && result.pagination;
  if (pagination && typeof pagination === "object") {
    return {
      hasMore: Boolean(pagination.hasMore),
      nextStartRow:
        typeof pagination.nextStartRow === "number"
          ? pagination.nextStartRow
          : startRow + pageLength,
    };
  }

  if (
    result &&
    typeof result.count === "number" &&
    Number.isFinite(result.count)
  ) {
    const nextStartRow = startRow + pageLength;
    return {
      hasMore: nextStartRow <= result.count,
      nextStartRow,
    };
  }

  return {
    hasMore: pageLength >= pageSize && pageLength > 0,
    nextStartRow: startRow + pageLength,
  };
}

function extractApiTotalCount(result) {
  const paginationTotalRows =
    result && result.pagination && Number(result.pagination.totalRows);
  if (Number.isFinite(paginationTotalRows)) {
    return paginationTotalRows;
  }

  return null;
}
