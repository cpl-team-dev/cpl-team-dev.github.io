document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("toy-feedback-track");
  const dotsEl = document.getElementById("toy-feedback-dots");

  if (!track || !dotsEl) {
    return;
  }

  const testimonials = [
    "Amazing, we do not have the space for lots of toys, so this is great! A mixture of educational and fun toys. Lots of choice for families with children of different ages and interests.",
    "The toy library is the best thing about Southampton. We love the community there that the toy library creates and think the staff they do a brilliant job.",
    "This toy library is such a massive asset to the community. I tell all parents I know to use this incredible resource - the ladies here are also amazing.",
    "The toy library is the best thing about Southampton. We love the community there that the toy library creates and think the staff they do a brilliant job.",
    "This service is amazing! we can try out lots of different board games and jigsaws without having to buy them. it enhances child development and avoids waste. we really love the big physical toys too, which you wouldn't accumulate at home, and have discovered new types of toys. Friends who live in different cities are always jealous when I describe this service!",
    "I absolutely love the toy library it has made a huge difference to my mental health my child's development and the community support in the area thank you!",
    "The toy library is the best thing about Southampton. We love the community there that the toy library creates and think the staff they do a brilliant job."
  ];
  const autoAdvanceMs = 3500;

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
    const activeIndex =
      ((idx % testimonials.length) + testimonials.length) % testimonials.length;

    dotsEl.innerHTML = testimonials
      .map(
        (_, i) =>
          `<button class="quote-dot ${
            i === activeIndex ? "active" : ""
          }" data-index="${i}" aria-label="Go to quote ${i + 1}"></button>`
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
    if (isAnimating) {
      return;
    }

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
    .map(
      (testimonial) => `
        <div class="toy-libraries-feedback-slide">
          <div class="toy-libraries-feedback-slide-card">
            <div class="toy-libraries-feedback-quote-mark" aria-hidden="true">“</div>
            <p>${testimonial}</p>
          </div>
        </div>`
    )
    .join("");

  track.addEventListener("transitionend", () => {
    if (!isAnimating) {
      return;
    }

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
