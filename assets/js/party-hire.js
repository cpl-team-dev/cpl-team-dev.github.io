document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".faq-item .faq-q").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      if (!item) return;
      item.classList.toggle("open");
      const marker = button.querySelector("span");
      if (marker) {
        marker.textContent = item.classList.contains("open") ? "▾" : "▸";
      }
    });
  });

  const toyListField = document.getElementById("ph-toy-list-field");
  const toyListInput = document.getElementById("ph-toy-list");
  const requestToysYes = document.getElementById("ph-request-toys-yes");
  const requestToysNo = document.getElementById("ph-request-toys-no");

  const toggleToyList = () => {
    if (!toyListField || !toyListInput) return;
    const show = requestToysYes && requestToysYes.checked;
    toyListField.hidden = !show;
    toyListInput.required = show;
  };

  if (requestToysYes) requestToysYes.addEventListener("change", toggleToyList);
  if (requestToysNo) requestToysNo.addEventListener("change", toggleToyList);

  const form = document.getElementById("party-hire-form");
  const success = document.getElementById("party-hire-success");

  if (!form || !success) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.style.display = "none";
    success.style.display = "block";
  });
});
