document.addEventListener("DOMContentLoaded", () => {
  const viewAllCard = document.querySelector(".view-all-card");
  const amenitiesModal = document.getElementById("amenities-modal");
  const closeAmenities = document.getElementById("closeAmenities");
  const amenitiesGrid = document.getElementById("amenitiesGrid");
  const amenitiesCount = document.getElementById("amenitiesCount");
  const amenitiesError = document.getElementById("amenitiesError");
  const amenitiesSearch = document.getElementById("amenitiesSearch");
  const amenitiesRefresh = document.getElementById("amenitiesRefresh");

  const AMENITIES_ENDPOINT = "/admin/amenities"; // adjust if needed
  let currentAmenities = [];

  const fallbackList = [
    "3 ft to 5 ft Swimming Pool",
    "WiFi Access",
    "1 AC Room with CR/Toilet",
    "Gym Equipment",
    "Microwave Oven",
    "Minibar",
    "Extra Mattresses",
    "Charcoal Griller",
    "Free Parking",
    "Karaoke",
    "Game Room (Billiards, Ping Pong, Darts)",
    "Gas Stove",
    '65" LED Smart TV',
    "Refrigerator",
    "Outdoor Shower Area",
    "24/7 CCTV Security"
  ];

  // Open / Close modal
  const openModal = () => {
    amenitiesModal.classList.add("active");
    loadAmenities();
  };
  const closeModal = () => amenitiesModal.classList.remove("active");

  if (viewAllCard) viewAllCard.addEventListener("click", openModal);
  closeAmenities.addEventListener("click", closeModal);
  window.addEventListener("keydown", e => e.key === "Escape" && amenitiesModal.classList.contains("active") && closeModal());
  window.addEventListener("click", e => e.target === amenitiesModal && closeModal());

  // Fetch amenities
  async function fetchAmenities() {
    let dbItems = [];
    try {
      const res = await fetch(`${AMENITIES_ENDPOINT}?_=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          dbItems = data.map((a) => ({
            id: a.amenityID ?? a.id ?? null,
            name: a.name ?? a.amenityName ?? a.amenity ?? "Untitled",
            description: a.description ?? a.desc ?? "",
          }));
        }
      } else {
        console.warn("Amenities fetch failed:", res.status);
      }
    } catch (err) {
      console.warn("Amenities fetch error:", err);
    }

    // ===== Merge fallback items =====
    const fallbackItems = fallbackList.map((name, i) => ({
      id: `f${i}`,
      name,
      description: ""
    }));

    // Avoid duplicates: only add fallback items not already in dbItems
    const merged = [...dbItems];
    fallbackItems.forEach(fb => {
      if (!dbItems.some(db => db.name.toLowerCase() === fb.name.toLowerCase())) {
        merged.push(fb);
      }
    });

    return merged;
  }

  // Render amenities
  function renderAmenities(items) {
    currentAmenities = items.slice();
    const query = amenitiesSearch.value.trim().toLowerCase();
    const filtered = items.filter(it =>
      it.name.toLowerCase().includes(query) ||
      (it.description && it.description.toLowerCase().includes(query))
    );

    amenitiesGrid.innerHTML = filtered.map(it => `
      <div class="amenity-item" data-id="${escapeHtml(it.id)}" tabindex="0">
        <div class="amenity-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <div class="amenity-title">${escapeHtml(it.name)}</div>
          ${it.description ? `<div class="amenity-desc">${escapeHtml(it.description)}</div>` : ""}
        </div>
      </div>
    `).join("");

    amenitiesCount.textContent = `${filtered.length} amenit${filtered.length === 1 ? "y" : "ies"} available`;
  }

  function escapeHtml(str = "") {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Load amenities
  async function loadAmenities() {
    amenitiesError.hidden = true;
    amenitiesCount.textContent = "Loading amenities...";
    const items = await fetchAmenities();
    if (!items) {
      amenitiesGrid.innerHTML = "<p>No amenities available.</p>";
      amenitiesError.hidden = false;
      return;
    }
    renderAmenities(items);
  }

  // Search & Refresh
  amenitiesSearch.addEventListener("input", () => renderAmenities(currentAmenities));
  amenitiesRefresh.addEventListener("click", async () => {
    amenitiesRefresh.disabled = true;
    await loadAmenities();
    amenitiesRefresh.disabled = false;
  });
});
