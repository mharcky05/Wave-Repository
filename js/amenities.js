// ===== AMENITIES MODAL SYSTEM =====
document.addEventListener("DOMContentLoaded", () => {
  const viewAllCard = document.querySelector(".view-all-card");
  const amenitiesModal = document.getElementById("amenities-modal");
  const closeAmenities = document.getElementById("closeAmenities");
  const amenitiesGrid = document.getElementById("amenitiesGrid");
  const amenitiesCount = document.getElementById("amenitiesCount");
  const amenitiesError = document.getElementById("amenitiesError");
  const amenitiesSearch = document.getElementById("amenitiesSearch");
  const amenitiesRefresh = document.getElementById("amenitiesRefresh");
  const fallbackList = Array.from(
    document.querySelectorAll("#amenitiesFallback li")
  ).map((li) => li.textContent.trim());

  const AMENITIES_ENDPOINT = "/admin/amenities"; // adjust if needed
  const POLL_INTERVAL_MS = 15000;
  let lastAmenitiesJson = null;
  let currentAmenities = [];
  let pollTimer = null;

  // ===== Modal Control =====
  function openModal() {
    amenitiesModal.classList.add("active");
    amenitiesModal.setAttribute("aria-hidden", "false");
    loadAmenities();
  }

  function closeModal() {
    amenitiesModal.classList.remove("active");
    amenitiesModal.setAttribute("aria-hidden", "true");
  }

  if (viewAllCard) viewAllCard.addEventListener("click", openModal);
  closeAmenities.addEventListener("click", closeModal);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && amenitiesModal.classList.contains("active")) closeModal();
  });

  window.addEventListener("click", (e) => {
    if (e.target === amenitiesModal) closeModal();
  });

  // ===== Fetch Amenities =====
  async function fetchAmenities() {
    try {
      const res = await fetch(`${AMENITIES_ENDPOINT}?_=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!Array.isArray(data)) throw new Error("Invalid response format");
      return data.map((a) => ({
        id: a.amenityID ?? a.id ?? null,
        name: a.name ?? a.amenityName ?? a.amenity ?? "Untitled",
        description: a.description ?? a.desc ?? "",
      }));
    } catch (err) {
      console.warn("Amenities fetch failed:", err);
      return null;
    }
  }

  // ===== Render Amenities =====
  function renderAmenities(items) {
    currentAmenities = items.slice();
    const query = amenitiesSearch.value.trim().toLowerCase();
    const filtered = items.filter(
      (it) =>
        it.name.toLowerCase().includes(query) ||
        (it.description && it.description.toLowerCase().includes(query))
    );

    amenitiesGrid.innerHTML = filtered
      .map(
        (it) => `
      <div class="amenity-item" data-id="${escapeHtml(it.id)}" tabindex="0">
        <div class="amenity-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <div>
          <div class="amenity-title">${escapeHtml(it.name)}</div>
          ${
            it.description
              ? `<div class="amenity-desc">${escapeHtml(it.description)}</div>`
              : ""
          }
        </div>
      </div>`
      )
      .join("");

    amenitiesCount.textContent = `${filtered.length} amenit${
      filtered.length === 1 ? "y" : "ies"
    } available`;
  }

  function escapeHtml(str = "") {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ===== Fallback =====
  function renderFallback() {
    renderAmenities(fallbackList.map((t, i) => ({ id: `f${i}`, name: t })));
    amenitiesError.hidden = false;
  }

  // ===== Loader =====
  async function loadAmenities() {
    amenitiesError.hidden = true;
    amenitiesCount.textContent = "Loading amenities...";
    const items = await fetchAmenities();
    if (!items) {
      renderFallback();
      return;
    }

    const json = JSON.stringify(items);
    if (json !== lastAmenitiesJson) {
      lastAmenitiesJson = json;
      renderAmenities(items);
    } else {
      renderAmenities(items);
    }
  }

  // ===== Search + Refresh =====
  amenitiesSearch.addEventListener("input", () => renderAmenities(currentAmenities));

  amenitiesRefresh.addEventListener("click", async () => {
    amenitiesRefresh.disabled = true;
    await loadAmenities();
    setTimeout(() => (amenitiesRefresh.disabled = false), 600);
  });

  // ===== Auto Refresh =====
  function startPolling() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(() => {
      if (amenitiesModal.classList.contains("active")) loadAmenities();
    }, POLL_INTERVAL_MS);
  }

  startPolling();
  loadAmenities();

  window.addEventListener("beforeunload", () => {
    if (pollTimer) clearInterval(pollTimer);
  });
});
