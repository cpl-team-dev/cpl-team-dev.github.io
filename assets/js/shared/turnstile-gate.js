// Turnstile tokens arrive asynchronously and are single-use, so a write
// request must wait for one, spend it exactly once, then reset the widget
// for a fresh token. Each gate tracks one widget through the callbacks
// named in its markup: data-callback="<name>", data-expired-callback=
// "<name>Expired", data-error-callback="<name>Error" and
// data-timeout-callback="<name>Timeout".
//
// Create gates at script top level (not inside DOMContentLoaded) so the
// globals exist before Turnstile looks them up.
function createTurnstileGate(options) {
  const selector = options.container;
  const callbackName = options.callbackName;
  const onChange = typeof options.onChange === "function" ? options.onChange : () => {};
  let token = "";

  function setToken(value) {
    token = typeof value === "string" ? value.trim() : "";
    onChange(Boolean(token));
  }

  window[callbackName] = (value) => setToken(value);
  window[`${callbackName}Expired`] = () => setToken("");
  window[`${callbackName}Error`] = () => setToken("");
  window[`${callbackName}Timeout`] = () => setToken("");

  return {
    hasToken() {
      return Boolean(token);
    },

    // Hands the token out once and forgets it, so the same token can never
    // go into a second request.
    take() {
      const value = token;
      setToken("");
      return value;
    },

    reset() {
      setToken("");
      if (!window.turnstile || !document.querySelector(selector)) return;
      try {
        window.turnstile.reset(selector);
      } catch (error) {
        console.warn("Unable to reset Turnstile widget.", error);
      }
    },
  };
}
