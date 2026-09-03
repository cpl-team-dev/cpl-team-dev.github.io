document.addEventListener("DOMContentLoaded", () => {
  const openDays = [
    { jsDay: 2, hours: "10am - 1pm" },
    { jsDay: 3, hours: "10am - 1pm" },
    { jsDay: 6, hours: "10am - 1pm" },
  ];
  const today = new Date();
  const todayIdx = today.getDay();
  const nowHour = today.getHours();
  const isOpenToday = openDays.some((day) => day.jsDay === todayIdx);
  const isCurrentlyOpen = isOpenToday && nowHour >= 10 && nowHour < 13;
  const status = document.querySelector("[data-opening-status]");
  const statusText = status?.querySelector(".announce-status-text");

  if (status && statusText) {
    status.classList.toggle("is-open", isCurrentlyOpen);
    statusText.textContent = isCurrentlyOpen
      ? "Open now"
      : isOpenToday
        ? "Closed - opens 10am"
        : "Closed today";
  }

  document.querySelectorAll(".announce-slot").forEach((slot) => {
    const slotDay = Number(slot.getAttribute("data-open-day"));
    slot.classList.toggle("is-today", slotDay === todayIdx);
  });

  const announceCarousel = document.querySelector("[data-announce-carousel]");
  if (announceCarousel) {
    const panels = Array.from(
      announceCarousel.querySelectorAll("[data-announce-panel]"),
    );
    const dots = Array.from(
      announceCarousel.querySelectorAll("[data-announce-dot]"),
    );
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let activeIndex = 0;
    let rotationId;

    const showPanel = (nextIndex) => {
      activeIndex = (nextIndex + panels.length) % panels.length;
      panels.forEach((panel, index) => {
        const isActive = index === activeIndex;
        panel.classList.toggle("is-active", isActive);
        panel.setAttribute("aria-hidden", String(!isActive));
        panel.inert = !isActive;
      });
      dots.forEach((dot, index) => {
        const isActive = index === activeIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
      });
    };

    const startRotation = () => {
      if (!prefersReducedMotion && !rotationId) {
        announceCarousel.classList.remove("is-paused");
        rotationId = window.setInterval(() => showPanel(activeIndex + 1), 4000);
      }
    };

    const stopRotation = () => {
      window.clearInterval(rotationId);
      rotationId = undefined;
      announceCarousel.classList.add("is-paused");
    };

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        showPanel(index);
        stopRotation();
        startRotation();
      });
    });

    announceCarousel.addEventListener("mouseenter", stopRotation);
    announceCarousel.addEventListener("mouseleave", startRotation);
    announceCarousel.addEventListener("focusin", stopRotation);
    announceCarousel.addEventListener("focusout", (event) => {
      if (!announceCarousel.contains(event.relatedTarget)) startRotation();
    });

    showPanel(activeIndex);
    startRotation();
  }

  setupContactForm({
    formId: "contact-form",
    successId: "contact-success",
    errorId: "contact-error",
    submitButtonText: "Submit",
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
