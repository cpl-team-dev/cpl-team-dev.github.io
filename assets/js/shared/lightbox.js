document.addEventListener("DOMContentLoaded", () => {
  const lightbox = document.getElementById("lightbox");
  const triggers = document.querySelectorAll("[data-lightbox-trigger]");

  if (!lightbox || !triggers.length) {
    return;
  }

  const image = document.getElementById("lightbox-image");
  const closeButton = document.getElementById("lightbox-close");
  const backdrop = lightbox.querySelector("[data-lightbox-close]");
  let lastTrigger = null;

  function closeLightbox() {
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    image.src = "";
    image.alt = "";
    document.body.style.overflow = "";

    if (lastTrigger) {
      lastTrigger.focus();
      lastTrigger = null;
    }
  }

  function openLightbox(trigger) {
    const img = trigger.querySelector("img");
    if (!img) {
      return;
    }

    lastTrigger = trigger;
    image.src = img.currentSrc || img.src;
    image.alt = img.alt || "";
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeButton.focus();
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => openLightbox(trigger));
  });

  if (backdrop) {
    backdrop.addEventListener("click", closeLightbox);
  }

  closeButton.addEventListener("click", closeLightbox);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) {
      closeLightbox();
    }
  });
});
