document.addEventListener("DOMContentLoaded", () => {
  const wraps = Array.from(document.querySelectorAll(".manage-table-wrap"));
  if (wraps.length === 0) return;

  const HINT_GAP = 8;
  const contextBar = document.querySelector(".manage-context-bar");

  wraps.forEach((wrap) => {
    const shell = wrap.closest(".manage-table-scroll-shell") || wrap.parentElement;
    if (!shell) return;
    const nextHint = shell.querySelector(".manage-table-scroll-hint");
    if (!nextHint) return;

    // The backward hint is the same chevron mirrored via CSS, so clone the
    // forward hint rather than duplicating the markup on every page.
    const prevHint = nextHint.cloneNode(true);
    prevHint.classList.add("manage-table-scroll-hint--prev");
    shell.insertBefore(prevHint, nextHint);
    const hints = [prevHint, nextHint];

    // Filter panels render as extra <thead> rows above the real column-header
    // row, so the hints rest on that last row by default. Once the page is
    // scrolled far enough that the sticky context bar would cover them, they
    // follow the viewport instead, clamped so they never leave the table.
    // `shell` is `position: relative`, so `top` is local to it.
    function alignHints() {
      const headRows = wrap.querySelectorAll("table thead tr");
      let restingTop = HINT_GAP;
      for (let i = 0; i < headRows.length - 1; i++) {
        restingTop += headRows[i].offsetHeight;
      }

      const stickyBottom = contextBar ? contextBar.getBoundingClientRect().bottom : 0;
      const followTop = stickyBottom - shell.getBoundingClientRect().top + HINT_GAP;
      const maxTop = shell.offsetHeight - nextHint.offsetHeight - HINT_GAP;
      const top = Math.max(restingTop, Math.min(followTop, maxTop));

      hints.forEach((hint) => {
        hint.style.top = `${top}px`;
      });
    }

    function update() {
      const overflow = wrap.scrollWidth - wrap.clientWidth;
      shell.classList.toggle("is-scrollable", overflow > 4);
      shell.classList.toggle("is-at-start", wrap.scrollLeft <= 4);
      shell.classList.toggle("is-at-end", wrap.scrollLeft >= overflow - 4);
      alignHints();
    }

    let frame = 0;
    function onPageScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        alignHints();
      });
    }

    wrap.addEventListener("scroll", update, { passive: true });
    window.addEventListener("scroll", onPageScroll, { passive: true });
    window.addEventListener("resize", update);

    if (typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(update);
      observer.observe(wrap);
      const table = wrap.querySelector("table");
      if (table) observer.observe(table);
    }

    update();
  });
});
