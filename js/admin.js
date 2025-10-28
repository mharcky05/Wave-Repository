document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".nav-btn");
  const sections = document.querySelectorAll(".tab-section");
  const notifBell = document.getElementById("notifBell");
  const notifDropdown = document.getElementById("notifDropdown");
  const notifCount = document.getElementById("notifCount");
  const popupContainer = document.getElementById("popupContainer");

  let notifList = [];

  // ======================
  // NAVIGATION
  // ======================
  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      sections.forEach((s) => s.classList.remove("active"));
      document.getElementById(btn.dataset.section).classList.add("active");
    });
  });

  // ======================
  // NOTIFICATION DROPDOWN
  // ======================
  if (notifBell) {
    notifBell.addEventListener("click", () => {
      notifDropdown.classList.toggle("show");
      notifCount.textContent = "0";
    });
  }

  function addNotification(message) {
    notifList.unshift(message);
    notifCount.textContent = notifList.length;

    notifDropdown.innerHTML = notifList.map((msg) => `<div>${msg}</div>`).join("");

    const popup = document.createElement("div");
    popup.className = "popup";
    popup.textContent = message;
    popupContainer.appendChild(popup);

    setTimeout(() => popup.remove(), 5000);
  }

  // ======================
  // PACKAGE MODAL
  // ======================
  const packageModal = document.getElementById("packageModal");
  const addPackageBtn = document.getElementById("addPackageBtn");
  const packageForm = document.getElementById("packageForm");

  if (addPackageBtn && packageModal && packageForm) {
    addPackageBtn.addEventListener("click", () => (packageModal.style.display = "flex"));
    packageForm.querySelector(".close-btn").addEventListener("click", () => (packageModal.style.display = "none"));
    packageForm.addEventListener("submit", (e) => {
      e.preventDefault();
      addNotification("New package added!");
      packageModal.style.display = "none";
      packageForm.reset();
    });
  }

  // ======================
  // AMENITY MODAL
  // ======================
  const amenityModal = document.getElementById("amenityModal");
  const addAmenityBtn = document.getElementById("addAmenityBtn");
  const amenityForm = document.getElementById("amenityForm");

  if (addAmenityBtn && amenityModal && amenityForm) {
    addAmenityBtn.addEventListener("click", () => (amenityModal.style.display = "flex"));
    amenityForm.querySelector(".close-btn").addEventListener("click", () => (amenityModal.style.display = "none"));
    amenityForm.addEventListener("submit", (e) => {
      e.preventDefault();
      addNotification("New amenity added!");
      amenityModal.style.display = "none";
      amenityForm.reset();
    });
  }

  // ======================
  // LOGOUT (FIXED)
  // ======================
  document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "logoutBtn") {
      e.preventDefault();
      console.log("✅ Logout button clicked!");
      localStorage.removeItem("adminLoggedIn");
      alert("Logged out successfully!");
      window.location.href = "../index.html";
    }
  });

  // ======================
  // INITIAL LOAD
  // ======================
  loadBookings();

  const guestRecordsBtn = document.getElementById("guest-records-btn");
  if (guestRecordsBtn) guestRecordsBtn.addEventListener("click", loadBookings);
});

// ======================
// OUTSIDE FUNCTIONS
// ======================

async function loadBookings() {
  try {
    const res = await fetch("http://localhost:3000/admin/bookings");
    const bookings = await res.json();

    const tableBody = document.getElementById("guestTableBody");
    if (!tableBody) return;
    tableBody.innerHTML = "";

    if (bookings.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="15" style="text-align:center;">No records yet</td></tr>`;
      return;
    }

    // ✅ Format date as MM/DD/YYYY
    const formatDate = (dateStr) => {
      if (!dateStr) return "N/A";
      const date = new Date(dateStr);
      if (isNaN(date)) return "N/A";
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const yyyy = date.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    };

    bookings.forEach((b) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${b.bookingID}</td>
        <td>${b.guestName || "N/A"}</td>
        <td>${b.packageName}</td>
        <td>${formatDate(b.checkinDate)}</td>
        <td>${b.checkinTime}</td>
        <td>${formatDate(b.checkoutDate)}</td>
        <td>${b.checkoutTime}</td>
        <td>${b.numGuests}</td>
        <td class="price">₱${Number(b.basePrice).toLocaleString()}</td>
        <td>${b.additionalPax || 0}</td>
        <td>${b.additionalHours || 0}</td>
        <td class="price">₱${Number(b.totalPrice).toLocaleString()}</td>
        <td class="status-cell">${b.status}</td>
        <td>${formatDate(b.createdAt)}</td>
        <td class="action-buttons">
          ${
            b.status === "Pending"
              ? `
                <button class="approve-btn" data-id="${b.bookingID}" title="Approve">✔</button>
                <button class="decline-btn" data-id="${b.bookingID}" title="Decline">✖</button>
              `
              : `<span>${b.status}</span>`
          }
        </td>
      `;
      tableBody.appendChild(row);
    });

    // ======================
    // APPROVE / DECLINE BUTTONS
    // ======================
    document.querySelectorAll(".approve-btn").forEach((btn) => {
      btn.addEventListener("click", () => updateBookingStatus(btn.dataset.id, "Approved"));
    });
    document.querySelectorAll(".decline-btn").forEach((btn) => {
      btn.addEventListener("click", () => updateBookingStatus(btn.dataset.id, "Declined"));
    });
  } catch (err) {
    console.error("❌ Error loading bookings:", err);
  }
}

// ======================
// UPDATE BOOKING STATUS
// ======================
async function updateBookingStatus(bookingID, status) {
  try {
    const res = await fetch(`http://localhost:3000/admin/bookings/${bookingID}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();
    if (res.ok) {
      alert(`Booking ${status}!`);
      loadBookings();
    } else {
      alert(`❌ Failed: ${data.message}`);
    }
  } catch (err) {
    console.error("❌ Error updating status:", err);
  }
}
