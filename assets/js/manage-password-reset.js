function getTurnstileToken(form) {
  return new FormData(form).get("cf-turnstile-response")?.toString() || "";
}

function resetTurnstile(container) {
  if (window.turnstile) {
    window.turnstile.reset(container);
  }
}

async function postPasswordResetJson(path, payload) {
  const response = await fetch(getApiEndpoint(path), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get("content-type") || "";
  const result = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok || !result || result.ok === false) {
    const message =
      result && typeof result.error === "string" && result.error.trim()
        ? result.error
        : `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return result;
}

document.addEventListener("DOMContentLoaded", () => {
  const requestStep = document.getElementById("request-reset-step");
  const resetStep = document.getElementById("reset-step");
  const requestForm = document.getElementById("request-reset-form");
  const resetForm = document.getElementById("reset-password-form");
  const emailInput = document.getElementById("reset-email-input");
  const requestButton = document.getElementById("request-reset-button");
  const sentEmail = document.getElementById("reset-sent-email");
  const startOverButton = document.getElementById("start-over-button");
  const newPasswordInput = document.getElementById("new-password-input");
  const newPasswordToggle = document.getElementById("new-password-toggle");
  const confirmPasswordInput = document.getElementById("confirm-password-input");
  const confirmPasswordToggle = document.getElementById("confirm-password-toggle");
  const resetButton = document.getElementById("reset-password-button");
  const statusBanner = document.getElementById("status-banner");
  const codeInputs = Array.from(document.querySelectorAll(".code-digit"));

  if (
    !requestStep ||
    !resetStep ||
    !requestForm ||
    !resetForm ||
    !emailInput ||
    !requestButton ||
    !sentEmail ||
    !startOverButton ||
    !newPasswordInput ||
    !confirmPasswordInput ||
    !resetButton ||
    !statusBanner ||
    codeInputs.length === 0
  ) {
    return;
  }

  function setupPasswordToggle(toggleButton, input) {
    if (!toggleButton) return;
    toggleButton.addEventListener("click", () => {
      const isVisible = input.type === "text";
      input.type = isVisible ? "password" : "text";
      toggleButton.setAttribute("aria-pressed", String(!isVisible));
      toggleButton.setAttribute(
        "aria-label",
        isVisible ? "Show password" : "Hide password",
      );
      toggleButton
        .querySelector(".icon-eye")
        .toggleAttribute("hidden", isVisible);
      toggleButton
        .querySelector(".icon-eye-off")
        .toggleAttribute("hidden", !isVisible);
    });
  }

  setupPasswordToggle(newPasswordToggle, newPasswordInput);
  setupPasswordToggle(confirmPasswordToggle, confirmPasswordInput);

  let requestedEmail = "";

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

  function setBusy(button, isBusy, idleLabel, busyLabel) {
    button.disabled = isBusy;
    button.textContent = isBusy ? busyLabel : idleLabel;
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

  function showResetStep(email) {
    requestedEmail = email;
    sentEmail.textContent = email;
    requestStep.hidden = true;
    resetStep.hidden = false;
    codeInputs.forEach((input) => {
      input.value = "";
    });
    newPasswordInput.value = "";
    confirmPasswordInput.value = "";
    codeInputs[0].focus();
    // The reset-password widget sits in a hidden panel at load, so it can only
    // start its challenge once shown-reset kicks off a fresh render/token.
    resetTurnstile("#reset-password-turnstile");
  }

  function showRequestStep() {
    requestedEmail = "";
    requestStep.hidden = false;
    resetStep.hidden = true;
    codeInputs.forEach((input) => {
      input.value = "";
    });
    newPasswordInput.value = "";
    confirmPasswordInput.value = "";
    setStatus("", "info");
    emailInput.focus();
  }

  requestForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("", "info");

    const email = emailInput.value.trim();

    if (!email || !emailInput.checkValidity()) {
      setStatus("Enter a valid email address before requesting a code.", "error");
      emailInput.focus();
      return;
    }

    setBusy(requestButton, true, "Send reset code", "Sending...");

    try {
      await postPasswordResetJson("/request-password-reset", {
        organisation_id: getOrganisationId(),
        email: email,
        cf_turnstile_response: getTurnstileToken(requestForm),
      });

      showResetStep(email);
      setStatus(
        "If an account exists for that email, we've sent a reset code.",
        "success",
      );
      resetTurnstile("#request-reset-turnstile");
    } catch (error) {
      // The endpoint never reveals whether the email matched an account, so
      // any failure here is a genuine service problem, not a "not found".
      setStatus("Something went wrong. Please try again shortly.", "error");
      resetTurnstile("#request-reset-turnstile");
    } finally {
      setBusy(requestButton, false, "Send reset code", "Sending...");
    }
  });

  resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("", "info");

    const code = getCodeValue();
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!requestedEmail) {
      setStatus("Request a reset code first.", "error");
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setStatus("Enter the full six-digit code.", "error");
      const firstEmptyInput = codeInputs.find((input) => !input.value);
      (firstEmptyInput || codeInputs[0]).focus();
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setStatus("Password must be at least 8 characters.", "error");
      newPasswordInput.focus();
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus("Passwords do not match.", "error");
      confirmPasswordInput.focus();
      return;
    }

    setBusy(resetButton, true, "Reset password", "Resetting...");

    try {
      await postPasswordResetJson("/reset-password", {
        organisation_id: getOrganisationId(),
        email: requestedEmail,
        code: code,
        new_password: newPassword,
        cf_turnstile_response: getTurnstileToken(resetForm),
      });

      if (typeof setManageLoginNotice === "function") {
        setManageLoginNotice(
          "Password updated. Please sign in with your new password.",
          "success",
        );
      }

      setStatus("Password updated. Redirecting to login...", "success");
      window.setTimeout(() => {
        window.location.href = "./login.html";
      }, 900);
    } catch (error) {
      const status = error && error.status;

      if (status === 401) {
        setStatus(
          "That code is invalid or has expired. Request a new one.",
          "error",
        );
      } else if (status === 400) {
        setStatus("Password must be at least 8 characters.", "error");
      } else {
        setStatus("Something went wrong. Please try again shortly.", "error");
      }

      resetTurnstile("#reset-password-turnstile");
    } finally {
      setBusy(resetButton, false, "Reset password", "Resetting...");
    }
  });

  startOverButton.addEventListener("click", () => {
    showRequestStep();
  });
});
