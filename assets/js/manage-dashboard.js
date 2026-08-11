document.addEventListener("DOMContentLoaded", () => {
  const session = requireManageSession("./login.html");
  if (!session) return;

  const accountEmail = document.getElementById("account-email");
  if (accountEmail) {
    accountEmail.textContent = session.email || "staff member";
  }

  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      manageLogout("./login.html");
    });
  }
});
