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
