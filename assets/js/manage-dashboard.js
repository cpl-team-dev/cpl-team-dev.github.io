document.addEventListener("DOMContentLoaded", () => {
  const session = requireManageSession("./login.html", ["admin", "member"]);
  if (!session) return;

  const isAdmin = getManageAccountType(session) === "admin";

  const accountEmail = document.getElementById("account-email");
  if (accountEmail) {
    accountEmail.textContent = session.email || "account";
  }

  document.querySelectorAll("[data-admin-only]").forEach((element) => {
    element.hidden = !isAdmin;
  });

  const pageTitle = document.getElementById("dashboard-title");
  const overviewTitle = document.getElementById("dashboard-overview-title");
  const overviewCopy = document.getElementById("dashboard-overview-copy");
  const usersCopy = document.getElementById("dashboard-users-copy");
  if (!isAdmin) {
    if (pageTitle) pageTitle.textContent = "Your account";
    if (overviewTitle) overviewTitle.textContent = "Manage your account";
    if (overviewCopy) {
      overviewCopy.textContent =
        "View and update the contact details held for your membership.";
    }
    if (usersCopy) usersCopy.textContent = "View and update your member profile.";
  }

  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      manageLogout("./login.html");
    });
  }
});
