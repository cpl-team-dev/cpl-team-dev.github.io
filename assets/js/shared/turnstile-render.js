// Renders every .cf-turnstile widget explicitly, so the sitekey comes from
// config.js (TURNSTILE_SITEKEY: test key locally, real key elsewhere)
// rather than being hard-coded in each page. Pages load api.js with
// ?render=explicit, so Turnstile never renders a widget on its own.
//
// Callback names stay in the markup (data-callback, data-expired-callback,
// data-error-callback, data-timeout-callback) and are looked up on window
// when Turnstile fires them, so the page script defining them can load
// before or after this one.
(function () {
  const CALLBACK_ATTRIBUTES = {
    callback: "data-callback",
    "expired-callback": "data-expired-callback",
    "error-callback": "data-error-callback",
    "timeout-callback": "data-timeout-callback",
  };

  function renderWidgets() {
    const sitekey = typeof TURNSTILE_SITEKEY === "string" ? TURNSTILE_SITEKEY : "";
    if (!sitekey) {
      console.warn("TURNSTILE_SITEKEY is not set - Turnstile widgets were not rendered.");
      return;
    }

    document.querySelectorAll(".cf-turnstile").forEach((container) => {
      if (container.dataset.turnstileRendered) return;

      const params = { sitekey };
      Object.entries(CALLBACK_ATTRIBUTES).forEach(([param, attribute]) => {
        const name = container.getAttribute(attribute);
        if (!name) return;
        params[param] = (...args) =>
          typeof window[name] === "function" ? window[name](...args) : undefined;
      });

      try {
        window.turnstile.render(container, params);
        container.dataset.turnstileRendered = "true";
      } catch (error) {
        console.warn("Unable to render Turnstile widget.", error);
      }
    });
  }

  function renderWhenDomReady() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", renderWidgets, { once: true });
    } else {
      renderWidgets();
    }
  }

  // api.js is loaded async, so it may have run before or after this script.
  if (window.turnstile) {
    renderWhenDomReady();
    return;
  }

  const apiScript = document.querySelector('script[src*="challenges.cloudflare.com/turnstile/"]');
  if (apiScript) apiScript.addEventListener("load", renderWhenDomReady, { once: true });
})();
