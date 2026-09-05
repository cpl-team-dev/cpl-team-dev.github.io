document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("home-carousel-track");
  const dots = document.getElementById("home-carousel-dots");
  const prev = document.getElementById("home-carousel-prev");
  const next = document.getElementById("home-carousel-next");

  if (!track || !dots || !prev || !next) return;

  const slides = [
    {
      src: "https://ik.imagekit.io/communityplaylink/website/index/Bitterne-2019.jpg",
      alt: "Children and families at a Community Playlink event"
    },
    {
      src: "https://ik.imagekit.io/communityplaylink/website/index/Toy-Library-2.jpg",
      alt: "Families exploring toys at the toy library"
    },
    {
      src: "https://ik.imagekit.io/communityplaylink/website/index/20230614_101210.jpg",
      alt: "Play session at Community Playlink"
    },
    {
      src: "https://ik.imagekit.io/communityplaylink/website/index/toy-library-1.jpg",
      alt: "Toy library shelves and play equipment"
    },
    {
      src: "https://ik.imagekit.io/communityplaylink/website/index/Hoglands-Park-Playday-26-07-2.jpg",
      alt: "Families enjoying a play day at Hoglands Park"
    },
    {
      src: "https://ik.imagekit.io/communityplaylink/website/index/playtime-fireworks.jpg",
      alt: "Fireworks board at a Community Playlink"
    },
    {
      src: "https://ik.imagekit.io/communityplaylink/website/index/playtime-1.jpg",
      alt: "Children playtime at a Community Playlink"
    }
  ];
  track.innerHTML = slides
    .map(
      (slide) =>
        `<div class="carousel-slide"><img src="${slide.src}" alt="${slide.alt}"></div>`
    )
    .join("");

  dots.innerHTML = slides
    .map(
      (_slide, index) =>
        `<button type="button" aria-label="Show photo ${index + 1}"></button>`
    )
    .join("");

  const slideEls = Array.from(track.children);
  const dotEls = Array.from(dots.children);
  let activeIndex = 0;

  function showSlide(index) {
    activeIndex = (index + slideEls.length) % slideEls.length;
    slideEls.forEach((el, i) => {
      el.classList.toggle("is-active", i === activeIndex);
    });
    dotEls.forEach((el, i) => {
      el.classList.toggle("is-active", i === activeIndex);
    });
  }

  prev.addEventListener("click", () => showSlide(activeIndex - 1));
  next.addEventListener("click", () => showSlide(activeIndex + 1));
  dotEls.forEach((dot, index) => {
    dot.addEventListener("click", () => showSlide(index));
  });

  showSlide(0);
});

document.addEventListener("DOMContentLoaded", () => {
  const countEls = document.querySelectorAll("[data-count-to]");
  if (!countEls.length) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function formatCount(value, suffix) {
    return `${Math.round(value).toLocaleString("en-GB")}${suffix}`;
  }

  function animateCount(el) {
    const target = Number(el.dataset.countTo);
    const suffix = el.dataset.countSuffix || "";

    if (prefersReducedMotion || !Number.isFinite(target)) {
      el.textContent = formatCount(target, suffix);
      return;
    }

    const duration = 1400;
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      el.textContent = formatCount(target * eased, suffix);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  // Group counters by their enclosing section so each group animates once,
  // the first time that section scrolls into view.
  const groups = new Map();
  countEls.forEach((el) => {
    const section = el.closest("section") || el.parentElement;
    if (!groups.has(section)) groups.set(section, []);
    groups.get(section).push(el);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const els = groups.get(entry.target);
        if (els) els.forEach(animateCount);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  groups.forEach((_els, section) => observer.observe(section));
});
