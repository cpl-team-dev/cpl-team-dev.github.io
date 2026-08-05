document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("back-top");
  if (!button) return;

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
