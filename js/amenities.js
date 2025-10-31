// ===== AMENITIES MODAL CONTROLS =====
document.addEventListener("DOMContentLoaded", () => {
  const viewAllCard = document.querySelector(".view-all-card");
  const amenitiesModal = document.getElementById("amenities-modal");
  const closeAmenities = document.getElementById("closeAmenities");

  // ===== OPEN AMENITIES MODAL =====
  if (viewAllCard) {
    viewAllCard.addEventListener("click", () => {
      amenitiesModal.classList.add("active");
    });
  }

  // ===== CLOSE AMENITIES MODAL =====
  if (closeAmenities) {
    closeAmenities.addEventListener("click", () => {
      amenitiesModal.classList.remove("active");
    });
  }

  // ===== CLOSE MODAL WHEN CLICKING OUTSIDE =====
  window.addEventListener("click", (e) => {
    if (e.target === amenitiesModal) {
      amenitiesModal.classList.remove("active");
    }
  });
});
