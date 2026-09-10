function getTurnstileToken(form) {
  return new FormData(form).get("cf-turnstile-response")?.toString() || "";
}

function resetTurnstile(container) {
  if (window.turnstile) {
    window.turnstile.reset(container);
  }
}

async function postAuthJson(path, payload) {
  const response = await fetch(getApiEndpoint(path), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseType = response.headers.get("content-type") || "";
  const result = responseType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok || (result && result.ok === false)) {
    const message =
      result && typeof result.error === "string" && result.error.trim()
        ? result.error
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return result;
}

document.addEventListener("DOMContentLoaded", () => {
  const loginCard = document.querySelector(".login-card");
  const requestStep = document.getElementById("request-step");
  const requestCodeForm = document.getElementById("request-code-form");
  const verifyCodeForm = document.getElementById("verify-code-form");
  const emailInput = document.getElementById("email-input");
  const passwordInput = document.getElementById("password-input");
  const passwordToggle = document.getElementById("password-toggle");
  const requestCodeButton = document.getElementById("request-code-button");
  const verificationPanel = document.getElementById("verification-panel");
  const verifyCodeButton = document.getElementById("verify-code-button");
  const resendCodeButton = document.getElementById("resend-code-button");
  const changeEmailButton = document.getElementById("change-email-button");
  const sentEmail = document.getElementById("sent-email");
  const statusBanner = document.getElementById("status-banner");
  const codeInputs = Array.from(document.querySelectorAll(".code-digit"));

  if (
    !loginCard ||
    !requestStep ||
    !requestCodeForm ||
    !verifyCodeForm ||
    !emailInput ||
    !passwordInput ||
    !requestCodeButton ||
    !verificationPanel ||
    !verifyCodeButton ||
    !resendCodeButton ||
    !changeEmailButton ||
    !sentEmail ||
    !statusBanner ||
    codeInputs.length === 0
  ) {
    return;
  }

  if (passwordToggle) {
    passwordToggle.addEventListener("click", () => {
      const isVisible = passwordInput.type === "text";
      passwordInput.type = isVisible ? "password" : "text";
      passwordToggle.setAttribute("aria-pressed", String(!isVisible));
      passwordToggle.setAttribute(
        "aria-label",
        isVisible ? "Show password" : "Hide password",
      );
      passwordToggle
        .querySelector(".icon-eye")
        .toggleAttribute("hidden", isVisible);
      passwordToggle
        .querySelector(".icon-eye-off")
        .toggleAttribute("hidden", !isVisible);
    });
  }

  let requestedEmail = "";
  let requestedUserRowNumber = null;

  function setStatus(message, state) {
    if (!message) {
      statusBanner.hidden = true;
      statusBanner.textContent = "";
      statusBanner.dataset.state = "info";
      return;
    }

    statusBanner.hidden = false;
    statusBanner.textContent = message;
    statusBanner.dataset.state = state || "info";
  }

  const loginWarning =
    typeof consumeManageLoginWarning === "function" ? consumeManageLoginWarning() : "";
  if (loginWarning) {
    setStatus(loginWarning, "error");
  }

  function setBusy(button, isBusy, idleLabel, busyLabel) {
    button.disabled = isBusy;
    button.textContent = isBusy ? busyLabel : idleLabel;
  }

  function showVerification(email, userRowNumber) {
    requestedEmail = email;
    requestedUserRowNumber = userRowNumber;
    sentEmail.textContent = email;
    requestStep.hidden = true;
    verificationPanel.hidden = false;
    loginCard.classList.add("is-verifying");
    emailInput.disabled = true;
    passwordInput.disabled = true;
    requestCodeButton.disabled = true;
    codeInputs.forEach((input) => {
      input.value = "";
    });
    codeInputs[0].focus();
    // The verify-code widget sits in a hidden panel at load, so it can only
    // start its challenge once shown-reset kicks off a fresh render/token.
    resetTurnstile("#verify-code-turnstile");
  }

  function resetVerification() {
    requestedEmail = "";
    requestedUserRowNumber = null;
    requestStep.hidden = false;
    verificationPanel.hidden = true;
    loginCard.classList.remove("is-verifying");
    emailInput.disabled = false;
    passwordInput.disabled = false;
    passwordInput.value = "";
    requestCodeButton.disabled = false;
    codeInputs.forEach((input) => {
      input.value = "";
    });
    setStatus("", "info");
    emailInput.focus();
  }

  function getCodeValue() {
    return codeInputs.map((input) => input.value.trim()).join("");
  }

  function applyCodeString(code) {
    const digits = code.replace(/\D/g, "").slice(0, codeInputs.length).split("");
    codeInputs.forEach((input, index) => {
      input.value = digits[index] || "";
    });

    const nextEmptyInput = codeInputs.find((input) => !input.value);
    (nextEmptyInput || codeInputs[codeInputs.length - 1]).focus();
  }

  codeInputs.forEach((input, index) => {
    input.addEventListener("input", (event) => {
      const value = event.target.value.replace(/\D/g, "");

      if (!value) {
        event.target.value = "";
        return;
      }

      event.target.value = value.charAt(value.length - 1);

      if (index < codeInputs.length - 1) {
        codeInputs[index + 1].focus();
      }
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Backspace" && !event.currentTarget.value && index > 0) {
        codeInputs[index - 1].focus();
      }

      if (event.key === "ArrowLeft" && index > 0) {
        event.preventDefault();
        codeInputs[index - 1].focus();
      }

      if (event.key === "ArrowRight" && index < codeInputs.length - 1) {
        event.preventDefault();
        codeInputs[index + 1].focus();
      }
    });

    input.addEventListener("paste", (event) => {
      event.preventDefault();
      applyCodeString((event.clipboardData || window.clipboardData).getData("text"));
    });
  });

  requestCodeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("", "info");

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !emailInput.checkValidity()) {
      setStatus("Enter a valid email address before requesting a code.", "error");
      emailInput.focus();
      return;
    }

    if (!password || password.length < 8) {
      setStatus("Enter a password of at least 8 characters.", "error");
      passwordInput.focus();
      return;
    }

    setBusy(requestCodeButton, true, "Send code", "Sending...");

    try {
      const result = await postAuthJson("/create-session", {
        organisation_id: getOrganisationId(),
        email: email,
        password: password,
        cf_turnstile_response: getTurnstileToken(requestCodeForm),
      });

      const userRowNumber = result?.data?.user_row_number;
      if (!Number.isFinite(Number(userRowNumber))) {
        throw new Error("The login response did not include the account reference.");
      }

      showVerification(email, Number(userRowNumber));
      setStatus("Code sent. Check your inbox and enter the six-digit number.", "success");
      resetTurnstile("#request-code-turnstile");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "We could not send a code right now. Please try again.",
        "error",
      );
      resetTurnstile("#request-code-turnstile");
    } finally {
      setBusy(requestCodeButton, false, "Send code", "Sending...");
    }
  });

  verifyCodeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("", "info");

    const code = getCodeValue();

    if (!requestedEmail) {
      setStatus("Request a code first.", "error");
      emailInput.focus();
      return;
    }

    if (!Number.isFinite(requestedUserRowNumber)) {
      setStatus("Request a new code before continuing.", "error");
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setStatus("Enter the full six-digit code.", "error");
      const firstEmptyInput = codeInputs.find((input) => !input.value);
      (firstEmptyInput || codeInputs[0]).focus();
      return;
    }

    setBusy(verifyCodeButton, true, "Verify code", "Verifying...");

    try {
      const result = await postAuthJson("/validate-session", {
        organisation_id: getOrganisationId(),
        email: requestedEmail,
        code: code,
        user_row_number: requestedUserRowNumber,
        cf_turnstile_response: getTurnstileToken(verifyCodeForm),
      });

      if (!result || !result.data || !getManageAuthorization(result.data)) {
        throw new Error("The login response did not include a session token.");
      }

      setManageSession(result.data);
      passwordInput.value = "";
      setStatus("Login successful. Redirecting...", "success");
      window.setTimeout(() => {
        window.location.href =
          getManageAccountType(result.data) === "member"
            ? "./users.html"
            : "./dashboard.html";
      }, 600);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "The code could not be verified. Please try again.",
        "error",
      );
      resetTurnstile("#verify-code-turnstile");
    } finally {
      setBusy(verifyCodeButton, false, "Verify code", "Verifying...");
    }
  });

  resendCodeButton.addEventListener("click", () => {
    if (!emailInput.value.trim() || !passwordInput.value) {
      setStatus("Enter your email and password before requesting a code.", "error");
      emailInput.focus();
      return;
    }

    requestCodeForm.requestSubmit();
  });

  changeEmailButton.addEventListener("click", () => {
    resetVerification();
  });
});
