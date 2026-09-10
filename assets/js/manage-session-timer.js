(function () {
  const WARNING_THRESHOLD_MS = 5 * 60 * 1000;
  const CRITICAL_THRESHOLD_MS = 60 * 1000;
  const EXPIRED_MESSAGE = "Your session has expired";

  function formatRemaining(ms) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  function showExpiryToast() {
    const toast = document.createElement("div");
    toast.className = "manage-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.textContent =
      "You'll be logged out in under a minute due to session expiry.";
    document.body.appendChild(toast);

    window.requestAnimationFrame(() => toast.classList.add("is-visible"));
    window.setTimeout(() => {
      toast.classList.remove("is-visible");
      window.setTimeout(() => toast.remove(), 300);
    }, 8000);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const session =
      typeof getManageSession === "function" ? getManageSession() : null;
    if (!session) return;

    const expiresAt =
      typeof getManageSessionExpiry === "function"
        ? getManageSessionExpiry(session)
        : "";
    const expiryTime = expiresAt ? new Date(expiresAt).getTime() : NaN;
    if (!Number.isFinite(expiryTime)) return;

    const footer = document.querySelector(".manage-sidebar-footer");
    if (!footer) return;

    const timer = document.createElement("div");
    timer.className = "manage-session-timer";
    timer.setAttribute("role", "timer");
    timer.setAttribute("aria-live", "off");
    timer.innerHTML =
      '<span class="manage-session-timer-label">Session expires in</span>' +
      '<span class="manage-session-timer-value">--:--</span>';
    footer.insertBefore(timer, footer.firstChild);

    const valueEl = timer.querySelector(".manage-session-timer-value");
    let toastShown = false;
    let intervalId = null;

    function expireSession() {
      if (intervalId) window.clearInterval(intervalId);
      if (typeof setManageLoginWarning === "function") {
        setManageLoginWarning(EXPIRED_MESSAGE);
      }
      if (typeof manageLogout === "function") {
        manageLogout("./login.html");
      }
    }

    function tick() {
      const remaining = expiryTime - Date.now();

      if (remaining <= 0) {
        valueEl.textContent = "0:00";
        expireSession();
        return;
      }

      valueEl.textContent = formatRemaining(remaining);
      timer.classList.toggle("is-warning", remaining <= WARNING_THRESHOLD_MS);

      if (remaining <= CRITICAL_THRESHOLD_MS && !toastShown) {
        toastShown = true;
        showExpiryToast();
      }
    }

    tick();
    intervalId = window.setInterval(tick, 1000);
  });
})();
