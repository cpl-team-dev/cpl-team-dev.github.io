document.addEventListener("DOMContentLoaded", () => {
  const contactsContainer = document.getElementById("group-form-contacts");
  const addContactButton = document.getElementById("group-form-add-contact");
  let contactCounter = contactsContainer
    ? contactsContainer.querySelectorAll(".group-form-contact").length
    : 0;

  function resetField(field) {
    if (field.type === "checkbox" || field.type === "radio") {
      field.checked = false;
    } else if (field.tagName === "SELECT") {
      field.value = "United Kingdom";
    } else {
      field.value = "";
    }
  }

  function reindexAttribute(el, attr, nextIndex) {
    if (!el.hasAttribute(attr)) return;
    el.setAttribute(attr, el.getAttribute(attr).replace(/-\d+$/, `-${nextIndex}`));
  }

  function addContact() {
    if (!contactsContainer) return;
    const template = contactsContainer.querySelector(".group-form-contact");
    if (!template) return;

    contactCounter += 1;
    const clone = template.cloneNode(true);
    clone.dataset.contactIndex = String(contactCounter);

    clone.querySelectorAll("[id]").forEach((el) => reindexAttribute(el, "id", contactCounter));
    clone.querySelectorAll("[for]").forEach((el) => reindexAttribute(el, "for", contactCounter));
    clone.querySelectorAll("[name]").forEach((el) => reindexAttribute(el, "name", contactCounter));
    clone.querySelectorAll("input, select, textarea").forEach(resetField);

    const removeButton = clone.querySelector(".group-form-remove-contact");
    if (removeButton) removeButton.hidden = false;

    contactsContainer.appendChild(clone);
  }

  if (addContactButton) {
    addContactButton.addEventListener("click", addContact);
  }

  if (contactsContainer) {
    contactsContainer.addEventListener("click", (event) => {
      const removeButton = event.target.closest(".group-form-remove-contact");
      if (!removeButton) return;
      const contact = removeButton.closest(".group-form-contact");
      if (contact) contact.remove();
    });
  }

  function collectContacts(form) {
    return Array.from(form.querySelectorAll(".group-form-contact")).map((block) => {
      const get = (name) =>
        block.querySelector(`[name^="contact-${name}-"]`)?.value?.toString().trim() || "";

      return {
        name: get("name"),
        position: get("position"),
        address: get("address"),
        city: get("city"),
        county: get("county"),
        postcode: get("postcode"),
        country: get("country"),
        phone: get("phone"),
        email: get("email"),
      };
    });
  }

  setupContactForm({
    formId: "group-form",
    successId: "group-form-success",
    errorId: "group-form-error",
    submitButtonText: "Submit application",
    successMessage:
      "Thank you-your group membership application has been sent! We'll be in touch to confirm the next steps.",
    buildPayload(form) {
      const formData = new FormData(form);
      const contacts = collectContacts(form);
      const primary = contacts[0] || {};
      const { firstName, lastName } = splitFullName(primary.name || "");

      const groupAddress = [
        formData.get("group-address")?.toString().trim() || "",
        formData.get("group-address-2")?.toString().trim() || "",
        formData.get("group-city")?.toString().trim() || "",
        formData.get("group-state")?.toString().trim() || "",
        formData.get("group-postcode")?.toString().trim() || "",
        formData.get("group-country")?.toString().trim() || "",
      ]
        .filter(Boolean)
        .join(", ");

      const messageSections = [
        "Subject - Group membership application",
        formatExtraMessageSections([
          {
            title: "Group name",
            value: formData.get("group-name")?.toString().trim() || "",
          },
          {
            title: "Group address",
            value: groupAddress,
          },
          {
            title: "Number of children attending",
            value: [
              `Ages 0-4: ${formData.get("children-0-4")?.toString() || "0"}`,
              `Ages 5-9: ${formData.get("children-5-9")?.toString() || "0"}`,
              `Ages 10+: ${formData.get("children-10-plus")?.toString() || "0"}`,
            ].join(", "),
          },
          ...contacts.map((contact, index) => ({
            title: `Main contact ${index + 1}`,
            value: [
              contact.name && `Name: ${contact.name}`,
              contact.position && `Position: ${contact.position}`,
              [contact.address, contact.city, contact.county, contact.postcode, contact.country]
                .filter(Boolean)
                .join(", "),
              contact.phone && `Phone: ${contact.phone}`,
              contact.email && `Email: ${contact.email}`,
            ]
              .filter(Boolean)
              .join("\n"),
          })),
        ]),
      ].filter(Boolean);

      return {
        first_name: firstName,
        last_name: lastName,
        organisation_id: typeof ORGANISATION_ID === "string" ? ORGANISATION_ID : "",
        email: primary.email || "",
        phone: primary.phone || "",
        enquiry_type: "Group membership application",
        message: messageSections.join("\n\n"),
      };
    },
  });
});
