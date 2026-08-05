document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("testimonial-track");
  const dotsEl = document.getElementById("testimonial-dots");

  if (!track || !dotsEl) return;

  const testimonials = [
    "The toy library is an invaluable resource for the local community providing accessible toys of all sorts to everyone.",
    "The toy library is the best thing about Southampton. We love the community there that the toy library creates and think the staff they do a brilliant job.",
    "Such a wonderful service. The staff are kind, and there is always something new for our children to enjoy.",
    "Community Playlink has been a lifeline for our family and has helped us through some really difficult periods.",
    "Amazing charity doing incredible work for families in Southampton. Highly recommended."
  ];
  const autoAdvanceMs = 3000;

  let idx = 0;
  let autoAdvanceId = null;
  let isAnimating = false;

  const loopedTestimonials = [
    testimonials[testimonials.length - 1],
    ...testimonials,
    testimonials[0]
  ];

  function updateTrack(animate = true) {
    track.style.transition = animate ? "transform 0.55s ease" : "none";
    track.style.transform = `translateX(-${(idx + 1) * 100}%)`;
  }

  function renderDots() {
    const activeIndex = ((idx % testimonials.length) + testimonials.length) % testimonials.length;

    dotsEl.innerHTML = testimonials
      .map(
        (_, i) =>
          `<button class="quote-dot ${i === activeIndex ? "active" : ""}" data-index="${i}" aria-label="Go to quote ${i + 1}"></button>`
      )
      .join("");

    dotsEl.querySelectorAll(".quote-dot").forEach((dot) => {
      dot.addEventListener("click", () => {
        const nextIndex = Number(dot.getAttribute("data-index"));
        if (!Number.isNaN(nextIndex) && nextIndex !== activeIndex) {
          goTo(nextIndex);
          restartAutoAdvance();
        }
      });
    });
  }

  function goTo(nextIndex) {
    if (isAnimating) return;

    idx = nextIndex;
    isAnimating = true;
    updateTrack(true);
    renderDots();
  }

  function restartAutoAdvance() {
    if (autoAdvanceId) {
      window.clearInterval(autoAdvanceId);
    }

    autoAdvanceId = window.setInterval(() => {
      goTo(idx + 1);
    }, autoAdvanceMs);
  }

  track.innerHTML = loopedTestimonials
    .map((testimonial) => `<div class="quote-slide"><p>${testimonial}</p></div>`)
    .join("");

  track.addEventListener("transitionend", () => {
    if (!isAnimating) return;

    if (idx >= testimonials.length) {
      idx = 0;
      updateTrack(false);
    } else if (idx < 0) {
      idx = testimonials.length - 1;
      updateTrack(false);
    }

    isAnimating = false;
    renderDots();
  });

  updateTrack(false);
  renderDots();
  restartAutoAdvance();
});
