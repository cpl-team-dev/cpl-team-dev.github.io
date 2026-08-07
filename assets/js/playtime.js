document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector("[data-playtime-gallery]");

  if (!gallery) {
    return;
  }

  const track = gallery.querySelector(".carousel-track");
  const slides = Array.from(gallery.querySelectorAll(".carousel-slide"));
  const dots = Array.from(gallery.querySelectorAll("[data-gallery-dot]"));
  const prev = gallery.querySelector("[data-gallery-prev]");
  const next = gallery.querySelector("[data-gallery-next]");

  if (!track || slides.length === 0 || dots.length === 0 || !prev || !next) {
    return;
  }

  let index = 0;
  let autoplayId = null;

  function render() {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === index;
      dot.classList.toggle("active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  function goTo(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    render();
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayId = window.setInterval(() => {
      goTo(index + 1);
    }, 4500);
  }

  function stopAutoplay() {
    if (autoplayId !== null) {
      window.clearInterval(autoplayId);
      autoplayId = null;
    }
  }

  prev.addEventListener("click", () => {
    goTo(index - 1);
    startAutoplay();
  });

  next.addEventListener("click", () => {
    goTo(index + 1);
    startAutoplay();
  });

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => {
      goTo(dotIndex);
      startAutoplay();
    });
  });

  gallery.addEventListener("mouseenter", stopAutoplay);
  gallery.addEventListener("mouseleave", startAutoplay);
  gallery.addEventListener("focusin", stopAutoplay);
  gallery.addEventListener("focusout", startAutoplay);

  render();
  startAutoplay();
});
