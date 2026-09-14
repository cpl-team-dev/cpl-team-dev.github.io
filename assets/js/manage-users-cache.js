const MANAGE_USERS_CACHE_KEY = "manage-users-cache";
const MANAGE_USERS_CACHE_REFRESHED_AT_KEY = "manage-users-cache-refreshed-at";
const MANAGE_USERS_CACHE_PATH = "/users";

let manageUsersCachePromise = null;

function getCachedManageUsers() {
  try {
    const raw = sessionStorage.getItem(MANAGE_USERS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    return null;
  }
}

function setCachedManageUsers(users) {
  try {
    sessionStorage.setItem(MANAGE_USERS_CACHE_KEY, JSON.stringify(Array.isArray(users) ? users : []));
    sessionStorage.setItem(MANAGE_USERS_CACHE_REFRESHED_AT_KEY, new Date().toISOString());
  } catch (error) {
    /* sessionStorage unavailable or full - modified_by lookups just won't resolve */
  }
}

function getCachedManageUsersRefreshedAt() {
  try {
    return sessionStorage.getItem(MANAGE_USERS_CACHE_REFRESHED_AT_KEY);
  } catch (error) {
    return null;
  }
}

function clearCachedManageUsers() {
  try {
    sessionStorage.removeItem(MANAGE_USERS_CACHE_KEY);
    sessionStorage.removeItem(MANAGE_USERS_CACHE_REFRESHED_AT_KEY);
  } catch (error) {
    /* sessionStorage unavailable */
  }
}

// Checks sessionStorage for a cached copy of the /users response first; only
// hits the network if nothing is cached yet (or forceRefresh is requested).
// Shared across /manage/ pages so the modified_by -> user lookup used by
// manage-audit-meta.js has data to work with without every page re-fetching
// the full user list itself.
function ensureManageUsersCache(session, options) {
  const opts = options || {};
  const forceRefresh = Boolean(opts.forceRefresh);

  if (!forceRefresh) {
    const cached = getCachedManageUsers();
    if (cached) return Promise.resolve(cached);
  }

  if (manageUsersCachePromise) return manageUsersCachePromise;

  const activeSession =
    session || (typeof getManageSession === "function" ? getManageSession() : null);

  if (!activeSession || typeof manageApiGet !== "function") {
    return Promise.resolve(getCachedManageUsers() || []);
  }

  manageUsersCachePromise = manageApiGet(MANAGE_USERS_CACHE_PATH, undefined, activeSession)
    .then((result) => {
      const list = typeof extractApiList === "function" ? extractApiList(result) : [];
      const users = Array.isArray(list) ? list : [];
      setCachedManageUsers(users);
      return users;
    })
    .catch(() => getCachedManageUsers() || [])
    .finally(() => {
      manageUsersCachePromise = null;
    });

  return manageUsersCachePromise;
}

function findManageUserById(id) {
  if (!id) return null;
  const users = getCachedManageUsers();
  if (!users) return null;
  return users.find((user) => String(user.id) === String(id)) || null;
}

function getManageUserDisplayName(user) {
  if (!user) return "";
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return name || user.email || "";
}

document.addEventListener("DOMContentLoaded", () => {
  // users.html populates this same cache itself as part of loading its own
  // admin user list, and keeps its loading state up until that happens - a
  // second, separate background fetch here would just be redundant.
  if (/\/users\.html$/.test(window.location.pathname)) return;

  const session = typeof getManageSession === "function" ? getManageSession() : null;
  if (!session) return;
  if (typeof getManageAccountType === "function" && getManageAccountType(session) !== "admin") return;

  ensureManageUsersCache(session);
});
