document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("home-carousel-track");
  const dots = document.getElementById("home-carousel-dots");
  const prev = document.getElementById("home-carousel-prev");
  const next = document.getElementById("home-carousel-next");

  if (!track || !dots || !prev || !next) return;

  const slides = [
    {
      src: "https://ik.imagekit.io/communityplaylink/website/Bitterne-2019.jpg",
      alt: "Children and families at a Community Playlink event"
    },
    {
      src: "https://ik.imagekit.io/communityplaylink/website/Toy-Library-2.jpg",
      alt: "Families exploring toys at the toy library"
    },
    {
      src: "https://ik.imagekit.io/communityplaylink/website/20230614_101210.jpg",
      alt: "Play session at Community Playlink"
    },
    {
      src: "https://ik.imagekit.io/communityplaylink/website/toy-library-1.jpg",
      alt: "Toy library shelves and play equipment"
    },
    {
      src: "https://ik.imagekit.io/communityplaylink/website/index/Hoglands-Park-Playday-26-07-2.jpg",
      alt: "Families enjoying a play day at Hoglands Park"
    },
    {
      src: "https://ik.imagekit.io/communityplaylink/website/playtime-fireworks.jpg",
      alt: "Fireworks board at a Community Playlink"
    },
    {
      src: "https://ik.imagekit.io/communityplaylink/website/playtime-1.jpg",
      alt: "Children playtime at a Community Playlink"
    }
  ];
  const autoAdvanceMs = 3000;

  let idx = 0;
  let autoAdvanceId = null;
  let isAnimating = false;

  const loopedSlides = [
    slides[slides.length - 1],
    ...slides,
    slides[0]
  ];

  function updateTrack(animate = true) {
    track.style.transition = animate ? "transform 0.55s ease" : "none";
    track.style.transform = `translateX(-${(idx + 1) * 100}%)`;
  }

  function renderDots() {
    const activeIndex = ((idx % slides.length) + slides.length) % slides.length;

    dots.innerHTML = slides
      .map(
        (_, i) =>
          `<button class="carousel-dot ${i === activeIndex ? "active" : ""}" data-index="${i}" aria-label="Go to image ${i + 1}"></button>`
      )
      .join("");

    dots.querySelectorAll(".carousel-dot").forEach((dot) => {
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

  track.innerHTML = loopedSlides
    .map(
      (slide) =>
        `<div class="carousel-slide"><img src="${slide.src}" alt="${slide.alt}"></div>`
    )
    .join("");

  track.addEventListener("transitionend", () => {
    if (!isAnimating) return;

    if (idx >= slides.length) {
      idx = 0;
      updateTrack(false);
    } else if (idx < 0) {
      idx = slides.length - 1;
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
