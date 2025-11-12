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
  "24/7 CCTV Security",
];

// ===== ADMIN PANEL MANAGEMENT SYSTEM =====
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".nav-btn");
  const sections = document.querySelectorAll(".tab-section");
  const notifBell = document.getElementById("notifBell");
  const notifDropdown = document.getElementById("notifDropdown");
  const notifCount = document.getElementById("notifCount");
  const popupContainer = document.getElementById("popupContainer");

  const tableBody = document.getElementById("amenityTableBody");
  const addBtn = document.getElementById("addAmenityBtn");
  const modal = document.getElementById("amenityModal");
  const form = document.getElementById("amenityForm");

  let notifList = [];

  // ===== TAB NAVIGATION SYSTEM =====
  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class from all tabs and sections
      tabs.forEach((b) => b.classList.remove("active"));
      sections.forEach((s) => s.classList.remove("active"));

      // Add active class to clicked tab and corresponding section
      btn.classList.add("active");
      document.getElementById(btn.dataset.section).classList.add("active");

      // Load data based on active tab
      switch (btn.dataset.section) {
        case "guest-records":
          loadBookings();
          break;
        case "transaction":
          loadTransactions();
          break;
        case "packages":
          loadPackages();
          break;
        case "amenities":
          loadAmenities();
          break;
        case "feedback":
          loadFeedbacks();
          break;
      }
    });
  });

  // ===== NOTIFICATION DROPDOWN TOGGLE =====
  if (notifBell) {
    notifBell.addEventListener("click", () => {
      notifDropdown.classList.toggle("show");
      notifCount.textContent = "0";
    });
  }

  // ===== NOTIFICATION MANAGEMENT FUNCTIONS =====
  function addNotification(message) {
    notifList.unshift(message);
    notifCount.textContent = notifList.length;

    notifDropdown.innerHTML = notifList
      .map((msg) => `<div>${msg}</div>`)
      .join("");

    const popup = document.createElement("div");
    popup.className = "popup";
    popup.textContent = message;
    popupContainer.appendChild(popup);

    setTimeout(() => popup.remove(), 5000);
  }

  async function loadPackages() {
    const tableBody = document.getElementById("packageTableBody");
    if (!tableBody) return;

    let packages = [];
    try {
      const res = await fetch("http://localhost:3000/admin/packages");
      if (res.ok) packages = await res.json();
      else console.warn("Failed to fetch packages:", res.status);
    } catch (err) {
      console.warn("Fetch error:", err);
    }

    // Render table
    tableBody.innerHTML = "";
    packages.forEach((pkg) => {
      const tr = document.createElement("tr");
      tr.dataset.id = pkg.packageID;

      tr.innerHTML = `
      <td>${pkg.packageType.replace(/ Package/gi, "")}</td>
      <td>${pkg.description}</td>
      <td class="price">₱${Number(pkg.price).toLocaleString()}</td>
      <td class="paxNo">${pkg.paxNo}</td>
      <td class="extraHour">₱${Number(pkg.addHourPrice).toLocaleString()}</td>
      <td class="extraPerson">₱${Number(
        pkg.addPersonPrice
      ).toLocaleString()}</td>
      <td>
        <button class="edit-package-btn">Edit</button>
      </td>
    `;
      tableBody.appendChild(tr);
    });

    if (!packages.length) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No packages yet</td></tr>`;
    }

    // ✅ ADD EVENT LISTENERS FOR EDIT BUTTONS
    document.querySelectorAll(".edit-package-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const row = btn.closest("tr");
        const pkgID = row.dataset.id;

        if (btn.textContent === "Edit") {
          // Convert to edit mode
          row.querySelector(
            ".price"
          ).innerHTML = `<input type="number" value="${row
            .querySelector(".price")
            .textContent.replace(/₱|,/g, "")}">`;
          row.querySelector(
            ".paxNo"
          ).innerHTML = `<input type="number" value="${
            row.querySelector(".paxNo").textContent
          }">`;
          row.querySelector(
            ".extraHour"
          ).innerHTML = `<input type="number" value="${row
            .querySelector(".extraHour")
            .textContent.replace(/₱|,/g, "")}">`;
          row.querySelector(
            ".extraPerson"
          ).innerHTML = `<input type="number" value="${row
            .querySelector(".extraPerson")
            .textContent.replace(/₱|,/g, "")}">`;
          btn.textContent = "Save";
        } else {
          // Save changes
          const updatedData = {
            price: Number(row.querySelector(".price input").value),
            paxNo: Number(row.querySelector(".paxNo input").value),
            extraHour: Number(row.querySelector(".extraHour input").value),
            extraPerson: Number(row.querySelector(".extraPerson input").value),
          };

          try {
            const res = await fetch(
              `http://localhost:3000/admin/packages/${pkgID}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
              }
            );

            const data = await res.json();
            if (res.ok && data.success) {
              row.querySelector(
                ".price"
              ).textContent = `₱${updatedData.price.toLocaleString()}`;
              row.querySelector(".paxNo").textContent = updatedData.paxNo;
              row.querySelector(
                ".extraHour"
              ).textContent = `₱${updatedData.extraHour.toLocaleString()}`;
              row.querySelector(
                ".extraPerson"
              ).textContent = `₱${updatedData.extraPerson.toLocaleString()}`;
              btn.textContent = "Edit";
              alert("✅ Package updated successfully!");
            } else {
              throw new Error(data.message || "Failed to update package");
            }
          } catch (err) {
            console.error("❌ Update package error:", err);
            alert("❌ Failed to update package. See console.");
          }
        }
      });
    });
  }

  // ===== AMENITY MANAGEMENT MODAL =====
  console.log("Add Amenity button:", document.getElementById("addAmenityBtn"));

  // Load amenities
  async function loadAmenities() {
    if (!tableBody) return;

    let amenities = [];
    try {
      const res = await fetch("http://localhost:3000/admin/amenities");
      if (res.ok) amenities = await res.json();
      else console.warn("Failed to fetch DB amenities:", res.status);
    } catch (err) {
      console.warn("Fetch error:", err);
    }

    // Merge fallback items
    const mergedAmenities = [...amenities];
    fallbackList.forEach((name) => {
      if (
        !mergedAmenities.some(
          (a) => a.amenityName?.toLowerCase() === name.toLowerCase()
        )
      ) {
        mergedAmenities.push({
          amenityID: ``,
          amenityName: name,
        });
      }
    });

    // Render table
    tableBody.innerHTML = "";
    if (!mergedAmenities.length) {
      tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">No amenities yet</td></tr>`;
      return;
    }

    mergedAmenities.forEach((a) => {
      const isFallback = !a.amenityID; // fallback items have no ID
      const row = document.createElement("tr");

      row.innerHTML = `
      <td>${a.amenityName}</td>

      <td>
        <button class="edit-amenity-btn" data-id="${a.amenityID || ""}" ${
        isFallback ? "disabled" : ""
      }>Edit</button>
        <button class="delete-amenity-btn" data-id="${a.amenityID || ""}" ${
        isFallback ? "disabled" : ""
      }>Delete</button>
      </td>
    `;
      tableBody.appendChild(row);
    });

    // Attach DB item actions
    document
      .querySelectorAll(".edit-amenity-btn:not([disabled])")
      .forEach((btn) => {
        btn.addEventListener("click", () => editAmenity(btn.dataset.id));
      });

    document
      .querySelectorAll(".delete-amenity-btn:not([disabled])")
      .forEach((btn) => {
        btn.addEventListener("click", () => deleteAmenity(btn.dataset.id));
      });
  }

  // Add Amenity button - FIXED
  if (addBtn && modal && form) {
    addBtn.addEventListener("click", () => (modal.style.display = "flex"));
    modal
      .querySelector(".close-btn")
      .addEventListener("click", () => (modal.style.display = "none"));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nameInput = form.querySelector('input[name="name"]');
      const name = nameInput.value.trim();

      if (!name) {
        alert("Amenity name is required.");
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/admin/amenities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amenityName: name }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to add amenity");
        }

        const data = await res.json();
        alert("✅ Amenity added!");
        modal.style.display = "none";
        form.reset();
        loadAmenities(); // refresh table
      } catch (err) {
        console.error("Add amenity error:", err);
        alert("Failed to add amenity: " + err.message);
      }
    });
  }

  // Edit Amenity function - FIXED
  async function editAmenity(amenityID) {
    const newName = prompt("Enter new amenity name:");
    if (!newName || !newName.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:3000/admin/amenities/${amenityID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amenityName: newName.trim() }),
        }
      );

      if (res.ok) {
        alert("✅ Amenity updated!");
        loadAmenities();
      } else {
        const errorData = await res.json();
        alert(
          "❌ Failed to update amenity: " +
            (errorData.message || "Unknown error")
        );
      }
    } catch (err) {
      console.error("Edit amenity error:", err);
      alert("❌ Error updating amenity");
    }
  }

  // Delete Amenity function
  async function deleteAmenity(amenityID) {
    if (!confirm("Are you sure you want to delete this amenity?")) return;

    try {
      const res = await fetch(
        `http://localhost:3000/admin/amenities/${amenityID}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        alert("✅ Amenity deleted!");
        loadAmenities();
      } else {
        alert("❌ Failed to delete amenity");
      }
    } catch (err) {
      console.error("Delete amenity error:", err);
      alert("❌ Error deleting amenity");
    }
  }

  // Initial load
  loadAmenities();

  // ===== ADMIN LOGOUT FUNCTIONALITY =====
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn?.addEventListener("click", function () {
    localStorage.clear();
    alert("Logout successful!");
    window.location.href = "/index.html";
  });

  // ===== INITIAL DATA LOAD =====
  loadBookings(); // Load guest records by default
  initFeedbackSystem();
});

// ===== BOOKINGS DATA LOADER =====
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

    // DATE FORMATTING HELPER
    const formatDate = (dateStr) => {
      if (!dateStr) return "N/A";
      const date = new Date(dateStr);
      if (isNaN(date)) return "N/A";
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const yyyy = date.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    };

    // POPULATE BOOKINGS TABLE
    bookings.forEach((b) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${b.bookingID}</td>
        <td>${b.guestName || "N/A"}</td>
        <td>${b.packageID}</td>
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

    // ===== BOOKING STATUS UPDATE BUTTONS =====
    document.querySelectorAll(".approve-btn").forEach((btn) => {
      btn.addEventListener("click", () =>
        updateBookingStatus(btn.dataset.id, "Approved")
      );
    });
    document.querySelectorAll(".decline-btn").forEach((btn) => {
      btn.addEventListener("click", () =>
        updateBookingStatus(btn.dataset.id, "Declined")
      );
    });
  } catch (err) {
    console.error("❌ Error loading bookings:", err);
  }
}

// ===== BOOKING STATUS UPDATE FUNCTION =====
async function updateBookingStatus(bookingID, status) {
  try {
    const res = await fetch(
      `http://localhost:3000/admin/bookings/${bookingID}/status`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );

    const data = await res.json();
    if (res.ok) {
      alert(`Booking ${status}!`);
      loadBookings();

      // SEND NOTIFICATION TO DATABASE
      await fetch("http://localhost:3000/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Booking #${bookingID} has been ${status}.`,
          status,
        }),
      });
    } else {
      alert(`❌ Failed: ${data.message}`);
    }
  } catch (err) {
    console.error("❌ Error updating status:", err);
  }
}

// ===== TRANSACTIONS DATA LOADER =====
async function loadTransactions() {
  try {
    console.log("🔄 Loading transactions..."); // DEBUG
    const res = await fetch("http://localhost:3000/api/payments/transactions");

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const transactions = await res.json();
    console.log("📊 Transactions loaded:", transactions); // DEBUG

    const tableBody = document.getElementById("transactionTableBody");
    if (!tableBody) {
      console.error("❌ transactionTableBody not found!");
      return;
    }

    tableBody.innerHTML = "";

    if (transactions.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="12" style="text-align:center;">No transactions yet</td></tr>`;
      return;
    }

    // DATE FORMATTING HELPER
    const formatDate = (dateStr) => {
      if (!dateStr) return "N/A";
      const date = new Date(dateStr);
      if (isNaN(date)) return "N/A";
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const yyyy = date.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    };

    // POPULATE TRANSACTIONS TABLE
    transactions.forEach((t) => {
      const row = document.createElement("tr");
      const guestName =
        `${t.firstName || ""} ${t.lastName || ""}`.trim() || "N/A";

      // ✅ IMPROVED: Handle booking data properly
      const packageID = t.packageID || "N/A";
      const checkinDate = t.checkinDate ? formatDate(t.checkinDate) : "N/A";
      const bookingTotal = t.bookingTotal
        ? `₱${Number(t.bookingTotal).toLocaleString()}`
        : "N/A";

      // FIX: Check both possible status values
      const isPending =
        t.status === "Pending Completion" || t.status === "Pending_Completion";

      row.innerHTML = `
        <td>${t.transactionID}</td>
        <td>${guestName}</td>
        <td>${t.contactNo || "N/A"}</td>
        <td>${packageID}</td>
        <td>${checkinDate}</td>
        <td class="price">${bookingTotal}</td>
        <td class="price">₱${Number(t.amount).toLocaleString()}</td>
        <td>${t.paymentMethod}</td>
        <td>${formatDate(t.transactionDate)}</td>
        <td class="status-cell ${
          t.status === "Completed" ? "completed" : "pending"
        }">${t.status}</td>
        <td>${t.remarks || "First Payment"}</td>
        <td class="action-buttons">
          ${
            isPending
              ? `<button class="complete-btn" data-id="${t.transactionID}" title="Mark as Completed">✓ Complete</button>`
              : `<span class="completed-text">Completed</span>`
          }
        </td>
      `;
      tableBody.appendChild(row);
    });

    // ===== COMPLETE TRANSACTION BUTTONS =====
    document.querySelectorAll(".complete-btn").forEach((btn) => {
      btn.addEventListener("click", () =>
        markTransactionCompleted(btn.dataset.id)
      );
    });
  } catch (err) {
    console.error("❌ Error loading transactions:", err);
  }
}

// ===== MARK TRANSACTION AS COMPLETED =====
async function markTransactionCompleted(transactionID) {
  if (
    !confirm(
      "Mark this transaction as completed? This means guest has paid fully at resort."
    )
  ) {
    return;
  }

  try {
    console.log("🔄 Marking transaction as completed:", transactionID); // DEBUG

    const res = await fetch(
      `http://localhost:3000/api/payments/transactions/${transactionID}/status`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Completed" }),
      }
    );

    // ✅ IMPROVED ERROR HANDLING
    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Server response:", errorText);
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log("📡 Status update response:", data); // DEBUG

    if (data.success) {
      alert("✅ Transaction marked as completed!");
      loadTransactions(); // Reload the table
    } else {
      alert(`❌ Failed: ${data.message}`);
    }
  } catch (err) {
    console.error("❌ Error completing transaction:", err);
    alert(
      "❌ Error updating transaction status. Please check console for details."
    );
  }
}

// ===== FEEDBACK SYSTEM =====
async function loadFeedbacks() {
  try {
    const res = await fetch("http://localhost:3000/api/feedback");
    const feedbacks = await res.json();

    const feedbacksList = document.getElementById("feedbacksList");
    if (!feedbacksList) return;

    feedbacksList.innerHTML = "";

    if (feedbacks.length === 0) {
      feedbacksList.innerHTML = `<p style="text-align: center; color: #666;">No feedbacks yet</p>`;
      return;
    }

    feedbacks.forEach((feedback) => {
      const feedbackCard = document.createElement("div");
      feedbackCard.className = "feedback-card";

      // ✅ YELLOW STARS - Same as public feedbacks
      const stars = this.renderStaticStars(feedback.rating);

      feedbackCard.innerHTML = `
        <div class="feedback-header">
          <strong>${feedback.guestName || "Anonymous"}</strong>
          <span class="feedback-date">${new Date(
            feedback.createdAt
          ).toLocaleDateString()}</span>
        </div>
        <div class="feedback-rating">${stars}</div>
        <div class="feedback-comments">${feedback.comments}</div>
        ${
          feedback.packageID
            ? `<div class="feedback-booking">Package: ${feedback.packageID}</div>`
            : ""
        }
      `;

      feedbacksList.appendChild(feedbackCard);
    });
  } catch (err) {
    console.error("❌ Error loading feedbacks:", err);
  }
}

// ✅ DAGDAG: Star rendering function for admin
function renderStaticStars(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars += '<span class="star filled">★</span>'; // Filled YELLOW star
    } else {
      stars += '<span class="star empty">☆</span>'; // Outline GRAY star
    }
  }
  return stars;
}
// Initialize feedback system
function initFeedbackSystem() {
  const requestFeedbackBtn = document.getElementById("requestFeedbackBtn");
  const feedbackRequestModal = document.getElementById("feedbackRequestModal");
  const feedbackRequestForm = document.getElementById("feedbackRequestForm");
  const closeFeedbackModal = document.querySelector(".close-feedback-modal");

  if (requestFeedbackBtn) {
    requestFeedbackBtn.addEventListener("click", () => {
      feedbackRequestModal.style.display = "flex";
      loadGuestsForFeedback();
    });
  }

  if (closeFeedbackModal) {
    closeFeedbackModal.addEventListener("click", () => {
      feedbackRequestModal.style.display = "none";
    });
  }

  if (feedbackRequestForm) {
    feedbackRequestForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const guestID = document.getElementById("feedbackGuestSelect").value;
      const bookingID = document.getElementById("feedbackBookingSelect").value;

      if (!guestID) {
        alert("Please select a guest");
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/api/feedback/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guestID, bookingID }),
        });

        const data = await res.json();

        if (res.ok) {
          alert("✅ Feedback request sent!");
          feedbackRequestModal.style.display = "none";
          feedbackRequestForm.reset();
        } else {
          alert(`❌ ${data.message}`);
        }
      } catch (err) {
        console.error("❌ Error sending feedback request:", err);
        alert("Failed to send feedback request");
      }
    });
  }
}

async function loadGuestsForFeedback() {
  try {
    const res = await fetch("http://localhost:3000/admin/bookings");
    const bookings = await res.json();

    const guestSelect = document.getElementById("feedbackGuestSelect");
    const bookingSelect = document.getElementById("feedbackBookingSelect");

    if (!guestSelect || !bookingSelect) return;

    // Clear previous options
    guestSelect.innerHTML = '<option value="">-- Select Guest --</option>';
    bookingSelect.innerHTML = '<option value="">-- Select Booking --</option>';

    // Get unique guests
    const uniqueGuests = {};
    bookings.forEach((booking) => {
      if (booking.guestID && booking.guestName) {
        uniqueGuests[booking.guestID] = booking.guestName;
      }
    });

    // Populate guest dropdown
    Object.entries(uniqueGuests).forEach(([guestID, guestName]) => {
      const option = document.createElement("option");
      option.value = guestID;
      option.textContent = guestName;
      guestSelect.appendChild(option);
    });

    // Populate booking dropdown
    bookings.forEach((booking) => {
      if (booking.bookingID && booking.packageID) {
        const option = document.createElement("option");
        option.value = booking.bookingID;
        option.textContent = `${booking.bookingID} - ${booking.packageID}`;
        bookingSelect.appendChild(option);
      }
    });
  } catch (err) {
    console.error("❌ Error loading guests:", err);
  }
}
