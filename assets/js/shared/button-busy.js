// Sets a button's label and, while a write request is in flight, shows a
// spinner in front of it. The label is set with textContent, so it is never
// parsed as HTML.
function setButtonBusyState(button, label, isBusy) {
  if (!button) return;

  button.textContent = label;
  button.setAttribute("aria-busy", isBusy ? "true" : "false");
  if (!isBusy) return;

  const spinner = document.createElement("span");
  spinner.className = "button-spinner";
  spinner.setAttribute("aria-hidden", "true");
  button.prepend(spinner);
}
