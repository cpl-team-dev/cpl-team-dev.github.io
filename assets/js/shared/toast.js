(function () {
  const CONTAINER_ID = "toast-container";
  const DEFAULT_DURATION = 5000;
  const TOAST_TYPES = ["info", "warning", "error"];

  function getContainer() {
    let container = document.getElementById(CONTAINER_ID);
    if (!container) {
      container = document.createElement("div");
      container.id = CONTAINER_ID;
      container.className = "toast-container";
      container.setAttribute("aria-live", "polite");
      container.setAttribute("aria-atomic", "false");
      document.body.appendChild(container);
    }
    return container;
  }

  function showToast(message, options) {
    if (!message) return () => {};

    const opts = typeof options === "string" ? { type: options } : options || {};
    const type = TOAST_TYPES.includes(opts.type) ? opts.type : "info";
    const duration = typeof opts.duration === "number" ? opts.duration : DEFAULT_DURATION;

    const container = getContainer();

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    if (duration > 0) {
      toast.style.setProperty("--toast-duration", `${duration}ms`);
    }

    const text = document.createElement("span");
    text.className = "toast-message";
    text.textContent = message;
    toast.appendChild(text);

    if (duration > 0) {
      const progress = document.createElement("span");
      progress.className = "toast-progress";
      progress.setAttribute("aria-hidden", "true");
      toast.appendChild(progress);
    }

    container.appendChild(toast);

    // Double rAF so the initial (pre-transition) styles are committed to the
    // page before adding the class that transitions them - otherwise the
    // toast can pop straight to its visible state with no animation.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add("is-visible"));
    });

    let dismissTimer = null;

    const dismiss = () => {
      if (dismissTimer) window.clearTimeout(dismissTimer);
      if (!toast.isConnected || toast.classList.contains("is-leaving")) return;
      toast.classList.remove("is-visible");
      toast.classList.add("is-leaving");
      window.setTimeout(() => toast.remove(), 300);
    };

    if (duration > 0) {
      dismissTimer = window.setTimeout(dismiss, duration);
    }

    toast.addEventListener("click", dismiss);

    return dismiss;
  }

  window.showToast = showToast;
})();
