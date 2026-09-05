function showAdminShortcut() {
  const adminShortcut = document.getElementById("admin-shortcut");
  if (!adminShortcut || typeof getManageSession !== "function") return;

  const session = getManageSession();
  if (session && getManageAccountType(session) === "admin") {
    adminShortcut.classList.add("is-visible");
  }
}

document.addEventListener("DOMContentLoaded", showAdminShortcut);
