const MANAGE_SESSION_KEY = "session-token";

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

function requireManageSession(loginPath) {
  const session = getManageSession();
  if (!session) {
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
