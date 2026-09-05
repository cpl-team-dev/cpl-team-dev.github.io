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
});
