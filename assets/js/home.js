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
