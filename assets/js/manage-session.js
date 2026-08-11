const MANAGE_SESSION_KEY = "session-token";
const MANAGE_LOGIN_WARNING_KEY = "manage-login-warning";

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

  const directKeys = [
    "type",
    "account_type",
    "accountType",
    "user_type",
    "userType",
    "role",
  ];

  for (const key of directKeys) {
    const value = session[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim().toLowerCase();
    }
  }

  const nestedKeys = ["user", "account", "profile", "member"];
  for (const key of nestedKeys) {
    const value = session[key];
    if (!value || typeof value !== "object") continue;

    const nestedType = getManageAccountType(value);
    if (nestedType) return nestedType;
  }

  return "";
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

function requireManageSession(loginPath) {
  const session = getManageSession();
  if (!session) {
    clearManageSession();
    window.location.href = loginPath || "./login.html";
    return null;
  }

  if (getManageAccountType(session) !== "admin") {
    setManageLoginWarning("This is not an admin account");
    clearManageSession();
    window.location.href = loginPath || "./login.html";
    return null;
  }

  return session;
}

function manageLogout(loginPath) {
  clearManageSession();
  window.location.href = loginPath || "./login.html";
}
