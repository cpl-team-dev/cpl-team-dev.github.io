document.addEventListener("DOMContentLoaded", () => {
  setupContactForm({
    formId: "volunteer-form",
    successId: "volunteer-success",
    errorId: "volunteer-error",
    submitButtonText: "Submit application",
    successMessage: "Application submitted. Thank you for volunteering.",
    validate(form) {
      const interestInputs = Array.from(
        form.querySelectorAll('input[name="interests"]'),
      );
      const hasSelectedInterest = interestInputs.some((input) => input.checked);
      const firstInterestInput = interestInputs[0];

      if (!firstInterestInput) {
        return true;
      }

      firstInterestInput.setCustomValidity(
        hasSelectedInterest ? "" : "Please select at least one area to get involved with.",
      );

      if (!hasSelectedInterest) {
        firstInterestInput.reportValidity();
        return false;
      }

      return true;
    },
    buildPayload(form) {
      const formData = new FormData(form);
      const { firstName, lastName } = splitFullName(
        formData.get("name")?.toString() || "",
      );
      const interests = formData.getAll("interests").map((value) => value.toString());
      const messageSections = [
        "Subject - Support us enquiry",
        formData.get("motivation")?.toString().trim() || "",
        formatExtraMessageSections([
          {
            title: "Is there anything you're volunteering for?",
            value: formData.get("volunteering-for")?.toString() || "",
          },
          {
            title: "What would you like to get involved with?",
            value: interests.join(", "),
          },
          {
            title: "What's your availability?",
            value: formData.get("availability")?.toString() || "",
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
        enquiry_type: "Support us enquiry",
        message: messageSections.join("\n\n"),
      };
    },
  });
});
