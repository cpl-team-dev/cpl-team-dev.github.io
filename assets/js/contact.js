document.addEventListener("DOMContentLoaded", () => {
  setupContactForm({
    formId: "contact-form",
    successId: "contact-success",
    errorId: "contact-error",
    submitButtonText: "Send message →",
    successMessage: "Message sent! Thank you for getting in touch.",
    buildPayload(form) {
      const formData = new FormData(form);
      const { firstName, lastName } = splitFullName(
        formData.get("name")?.toString() || "",
      );
      const subject = formData.get("subject")?.toString().trim() || "";
      const messageBody = formData.get("message")?.toString().trim() || "";

      return {
        first_name: firstName,
        last_name: lastName,
        organisation_id:
          typeof ORGANISATION_ID === "string" ? ORGANISATION_ID : "",
        email: formData.get("email")?.toString().trim() || "",
        phone: formData.get("phone")?.toString().trim() || "",
        enquiry_type: "General enquiry",
        message: [`Subject - ${subject}`, messageBody]
          .filter(Boolean)
          .join("\n\n"),
        cf_turnstile_response:
          formData.get("cf-turnstile-response")?.toString() || "",
      };
    },
  });
});
