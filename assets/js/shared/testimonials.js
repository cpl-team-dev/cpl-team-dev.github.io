document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("testimonial-track");
  const dotsEl = document.getElementById("testimonial-dots");
  const prev = document.getElementById("testimonial-prev");
  const next = document.getElementById("testimonial-next");

  if (!track || !dotsEl || !prev || !next) return;

  const testimonials = [
    {
      quote: "The toy library is an invaluable resource for the local community providing accessible toys of all sorts to everyone.",
      author: "Parent member"
    },
    {
      quote: "The toy library is the best thing about Southampton. We love the community there that the toy library creates and think the staff they do a brilliant job.",
      author: "Regular visitor"
    },
    {
      quote: "Such a wonderful service. The staff are kind, and there is always something new for our children to enjoy.",
      author: "Family member"
    },
    {
      quote: "Community Playlink has been a lifeline for our family and has helped us through some really difficult periods.",
      author: "Toddler group parent"
    },
    {
      quote: "Amazing charity doing incredible work for families in Southampton. Highly recommended.",
      author: "Long-term member"
    }
  ];
  const autoAdvanceMs = 5000;

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
    .map(
      (testimonial) => `
        <article class="quote-slide">
          <blockquote>&ldquo;${testimonial.quote}&rdquo;</blockquote>
          <cite>&mdash; ${testimonial.author}</cite>
        </article>
      `
    )
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

  prev.addEventListener("click", () => {
    goTo(idx - 1);
    restartAutoAdvance();
  });

  next.addEventListener("click", () => {
    goTo(idx + 1);
    restartAutoAdvance();
  });

  updateTrack(false);
  renderDots();
  restartAutoAdvance();
});
