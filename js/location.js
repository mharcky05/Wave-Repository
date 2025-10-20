// --- VIEW LOCATION BUTTON ---
document.addEventListener("DOMContentLoaded", () => {
  const viewLocationBtn = document.querySelector(".view-location");

  if (viewLocationBtn) {
    viewLocationBtn.addEventListener("click", () => {
      // Google Maps link of the resort
      window.open(
        "https://maps.app.goo.gl/85mPZMJucS1fEiiG7",
        "_blank"
      );
    });
  }
});
