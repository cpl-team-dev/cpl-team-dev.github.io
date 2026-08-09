function getContactEndpoint() {
  if (typeof API_BASE_URL === "string" && API_BASE_URL.trim()) {
    return `${API_BASE_URL.replace(/\/$/, "")}/contact`;
  }

  return "/contact";
}

function splitFullName(fullName) {
  const trimmed = fullName.trim().replace(/\s+/g, " ");

  if (!trimmed) {
    return {
      firstName: "",
      lastName: "",
    };
  }

  const parts = trimmed.split(" ");

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" ") || "Not given",
  };
}

function formatExtraMessageSections(extraFields) {
  return extraFields
    .filter(({ value }) => typeof value === "string" && value.trim())
    .map(({ title, value }) => `${title} - ${value.trim()}`)
    .join("\n\n");
}

async function submitContactPayload(payload) {
  const response = await fetch(getContactEndpoint(), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const responseType = response.headers.get("content-type") || "";

  if (responseType.includes("application/json")) {
    const result = await response.json();

    if (typeof result === "object" && result !== null && result.ok === false) {
      throw new Error("API returned an unsuccessful response.");
    }
  }
}

function setSubmissionState(button, isSubmitting, idleText) {
  if (!button) {
    return;
  }

  button.disabled = isSubmitting;
  button.textContent = isSubmitting ? "Sending..." : idleText;
}

function setupContactForm(options) {
  const {
    formId,
    successId,
    errorId,
    submitButtonText,
    buildPayload,
    successMessage,
    validate,
  } = options;

  const form = document.getElementById(formId);
  const success = document.getElementById(successId);
  const error = document.getElementById(errorId);

  if (!form || !success || !error) {
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const idleButtonText =
    submitButtonText ||
    (submitButton ? submitButton.textContent.trim() : "Submit");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    if (typeof validate === "function" && !validate(form)) {
      return;
    }

    success.style.display = "none";
    error.style.display = "none";
    error.textContent = "";
    setSubmissionState(submitButton, true, idleButtonText);

    try {
      const payload = buildPayload(form);
      await submitContactPayload(payload);

      form.reset();
      form.style.display = "none";
      success.textContent = successMessage;
      success.style.display = "block";
    } catch (submissionError) {
      console.error("Failed to submit contact form:", submissionError);
      error.textContent =
        "We could not send your message right now. Please try again in a moment.";
      error.style.display = "block";
    } finally {
      setSubmissionState(submitButton, false, idleButtonText);
    }
  });
}
