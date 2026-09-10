const MANAGE_SESSION_KEY = "session-token";
const MANAGE_LOGIN_WARNING_KEY = "manage-login-warning";
const MANAGE_LOGIN_NOTICE_KEY = "manage-login-notice";

function getManageAuthorization(session) {
  if (!session || typeof session !== "object") return "";
  if (typeof session.authorization === "string" && session.authorization) {
    return session.authorization;
  }

  const accessToken = session.access_token || session.accessToken;
  if (typeof accessToken !== "string" || !accessToken) return "";

  const tokenType = session.token_type || session.tokenType || "Bearer";
  return `${tokenType} ${accessToken}`;
}

function getManageSessionExpiry(session) {
  if (!session || typeof session !== "object") return "";
  return session.expires_at || session.expiresOn || "";
}

function getManageAccountType(session) {
  if (!session || typeof session !== "object") return "";
  return typeof session.user_type === "string" ? session.user_type.trim().toLowerCase() : "";
}

function getManageSession() {
  try {
    const raw = sessionStorage.getItem(MANAGE_SESSION_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    const token = getManageAuthorization(data);
    if (!data || typeof token !== "string" || !token) return null;

    const expiresAt = getManageSessionExpiry(data);
    if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

function setManageSession(data) {
  sessionStorage.setItem(MANAGE_SESSION_KEY, JSON.stringify(data));
}

function clearManageSession() {
  sessionStorage.removeItem(MANAGE_SESSION_KEY);
}

function setManageLoginWarning(message) {
  if (!message) {
    sessionStorage.removeItem(MANAGE_LOGIN_WARNING_KEY);
    return;
  }

  sessionStorage.setItem(MANAGE_LOGIN_WARNING_KEY, message);
}

function consumeManageLoginWarning() {
  const message = sessionStorage.getItem(MANAGE_LOGIN_WARNING_KEY) || "";
  sessionStorage.removeItem(MANAGE_LOGIN_WARNING_KEY);
  return message;
}

function setManageLoginNotice(message, state) {
  if (!message) {
    sessionStorage.removeItem(MANAGE_LOGIN_NOTICE_KEY);
    return;
  }

  sessionStorage.setItem(
    MANAGE_LOGIN_NOTICE_KEY,
    JSON.stringify({ message, state: state || "info" }),
  );
}

function consumeManageLoginNotice() {
  const raw = sessionStorage.getItem(MANAGE_LOGIN_NOTICE_KEY);
  sessionStorage.removeItem(MANAGE_LOGIN_NOTICE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function requireManageSession(loginPath, allowedAccountTypes) {
  const session = getManageSession();
  if (!session) {
    clearManageSession();
    window.location.href = loginPath || "./login.html";
    return null;
  }

  const allowedTypes = Array.isArray(allowedAccountTypes)
    ? allowedAccountTypes.map((type) => String(type).toLowerCase())
    : ["admin"];

  if (!allowedTypes.includes(getManageAccountType(session))) {
    window.location.href = "./dashboard.html";
    return null;
  }

  return session;
}

function manageLogout(loginPath) {
  clearManageSession();
  window.location.href = loginPath || "./login.html";
}
