// ===== GOOGLE MAPS LOCATION OPENER =====
document.addEventListener("DOMContentLoaded", () => {
  const viewLocationBtn = document.querySelector(".view-location");

  if (viewLocationBtn) {
    viewLocationBtn.addEventListener("click", () => {
      // GOOGLE MAPS LINK FOR RESORT LOCATION
      window.open(
        "https://maps.app.goo.gl/85mPZMJucS1fEiiG7",
        "_blank"
      );
    });
  }
});
