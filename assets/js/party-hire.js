document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".faq-item .faq-q").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      if (!item) return;
      item.classList.toggle("open");
      const marker = button.querySelector("span");
      if (marker) {
        marker.textContent = item.classList.contains("open") ? "▾" : "▸";
      }
    });
  });

  const toyListField = document.getElementById("ph-toy-list-field");
  const toyListInput = document.getElementById("ph-toy-list");
  const requestToysYes = document.getElementById("ph-request-toys-yes");
  const requestToysNo = document.getElementById("ph-request-toys-no");

  const toggleToyList = () => {
    if (!toyListField || !toyListInput) return;
    const show = requestToysYes && requestToysYes.checked;
    toyListField.hidden = !show;
    toyListInput.required = show;
  };

  if (requestToysYes) requestToysYes.addEventListener("change", toggleToyList);
  if (requestToysNo) requestToysNo.addEventListener("change", toggleToyList);
  toggleToyList();

  setupContactForm({
    formId: "party-hire-form",
    successId: "party-hire-success",
    errorId: "party-hire-error",
    submitButtonText: "Submit request",
    successMessage:
      "Thank you-your party hire request has been noted! We'll be in touch to confirm details and availability.",
    buildPayload(form) {
      const formData = new FormData(form);
      const { firstName, lastName } = splitFullName(
        formData.get("name")?.toString() || "",
      );
      const messageSections = [
        "Subject - Party hire enquiry",
        formatExtraMessageSections([
          {
            title: "Address",
            value: [
              formData.get("address")?.toString().trim() || "",
              formData.get("city")?.toString().trim() || "",
              formData.get("postcode")?.toString().trim() || "",
            ]
              .filter(Boolean)
              .join(", "),
          },
          {
            title: "Date of collection",
            value: formData.get("date-collect")?.toString() || "",
          },
          {
            title: "Date of return",
            value: formData.get("date-return")?.toString() || "",
          },
          {
            title: "Small bags of soft play",
            value: formData.get("soft-play-bags")?.toString() || "0",
          },
          {
            title: "Large bag of soft play",
            value: formData.get("large-bag")?.toString() || "",
          },
          {
            title: "Request toys",
            value: formData.get("request-toys")?.toString() || "",
          },
          {
            title: "Toy list",
            value: formData.get("toy-list")?.toString() || "",
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
        enquiry_type: "Party hire enquiry",
        message: messageSections.join("\n\n"),
        cf_turnstile_response:
          formData.get("cf-turnstile-response")?.toString() || "",
      };
    },
  });
});
