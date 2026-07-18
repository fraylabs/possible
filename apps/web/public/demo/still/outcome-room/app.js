const sitePreview = document.querySelector("#site-preview");
const viewportButtons = document.querySelectorAll("[data-width]");

for (const button of viewportButtons) {
  button.addEventListener("click", () => {
    const isMobile = button.dataset.width === "mobile";
    sitePreview.classList.toggle("mobile", isMobile);
    for (const candidate of viewportButtons) {
      const active = candidate === button;
      candidate.classList.toggle("active", active);
      candidate.setAttribute("aria-pressed", String(active));
    }
  });
}

const cadImage = document.querySelector("#cad-image");
const cadCaption = document.querySelector("#cad-caption");
const cadButtons = document.querySelectorAll("[data-image]");

for (const button of cadButtons) {
  button.addEventListener("click", () => {
    cadImage.src = `./assets/hardware/${button.dataset.image}`;
    cadImage.alt = button.dataset.alt;
    cadCaption.textContent = button.dataset.label;
    for (const candidate of cadButtons) {
      candidate.classList.toggle("active", candidate === button);
    }
  });
}
