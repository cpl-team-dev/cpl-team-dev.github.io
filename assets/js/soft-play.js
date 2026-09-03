document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".faq-item .faq-q").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      if (!item) return;
      item.classList.toggle("open");
      button.setAttribute(
        "aria-expanded",
        String(item.classList.contains("open")),
      );
    });
  });

  document.querySelectorAll("[data-soft-play-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const choice = button.dataset.softPlayChoice;
      const choiceInput = document.getElementById("ph-soft-play-choice");
      const choices = {
        small: "Small soft play bag (£5, approx. 4 pieces)",
        large: "Large soft play bag with mats (£10, approx. 8 pieces)",
        toys: "Soft play plus 10 toy bundle (£20)",
      };

      if (choiceInput && choices[choice]) choiceInput.value = choices[choice];
    });
  });

  setupContactForm({
    formId: "party-hire-form",
    successId: "party-hire-success",
    errorId: "party-hire-error",
    submitButtonText: "Submit request",
    successMessage:
      "Thank you - your soft play reservation request has been noted! We'll be in touch to confirm details and availability.",
    buildPayload(form) {
      const formData = new FormData(form);
      const { firstName, lastName } = splitFullName(
        formData.get("name")?.toString() || "",
      );
      const messageSections = [
        "Subject - Soft play reservation enquiry",
        formatExtraMessageSections([
          {
            title: "Date of collection",
            value: formData.get("date-collect")?.toString() || "",
          },
          {
            title: "Hire duration",
            value: formData.get("hire-duration")?.toString() || "",
          },
          {
            title: "Requested hire",
            value: formData.get("soft-play-choice")?.toString() || "",
          },
        ]),
      ].filter(Boolean);

      return {
        first_name: firstName,
        last_name: lastName,
        organisation_id:
          typeof ORGANISATION_ID === "string" ? ORGANISATION_ID : "",
        email: formData.get("email")?.toString().trim() || "",
        phone: formData.get("phone")?.toString().trim() || "",
        enquiry_type: "Soft play reservation enquiry",
        message: messageSections.join("\n\n"),
        cf_turnstile_response:
          formData.get("cf-turnstile-response")?.toString() || "",
      };
    },
  });
});
