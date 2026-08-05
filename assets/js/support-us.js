document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("volunteer-form");
  const success = document.getElementById("volunteer-success");

  if (!form || !success) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.style.display = "none";
    success.style.display = "block";
  });
});
