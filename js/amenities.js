document.addEventListener("DOMContentLoaded", () => {
  const viewAllCard = document.querySelector(".view-all-card");
  const amenitiesModal = document.getElementById("amenities-modal");
  const closeAmenities = document.getElementById("closeAmenities");

  if (viewAllCard) {
    viewAllCard.addEventListener("click", () => {
      amenitiesModal.classList.add("active");
    });
  }

  if (closeAmenities) {
    closeAmenities.addEventListener("click", () => {
      amenitiesModal.classList.remove("active");
    });
  }

  // Close when clicking outside modal
  window.addEventListener("click", (e) => {
    if (e.target === amenitiesModal) {
      amenitiesModal.classList.remove("active");
    }
  });
});
