// ===== ADMIN PANEL MANAGEMENT SYSTEM =====
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".nav-btn");
  const sections = document.querySelectorAll(".tab-section");
  const notifBell = document.getElementById("notifBell");
  const notifDropdown = document.getElementById("notifDropdown");
  const notifCount = document.getElementById("notifCount");
  const popupContainer = document.getElementById("popupContainer");

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
          // loadPackages(); - Add later if needed
          break;
        case "amenities":
          // loadAmenities(); - Add later if needed
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

  // ===== PACKAGE MANAGEMENT MODAL =====
  const packageModal = document.getElementById("packageModal");
  const addPackageBtn = document.getElementById("addPackageBtn");
  const packageForm = document.getElementById("packageForm");

  if (addPackageBtn && packageModal && packageForm) {
    addPackageBtn.addEventListener(
      "click",
      () => (packageModal.style.display = "flex")
    );
    packageForm
      .querySelector(".close-btn")
      .addEventListener("click", () => (packageModal.style.display = "none"));
    packageForm.addEventListener("submit", (e) => {
      e.preventDefault();
      addNotification("New package added!");
      packageModal.style.display = "none";
      packageForm.reset();
    });
  }

  // ===== AMENITY MANAGEMENT MODAL =====
  const amenityModal = document.getElementById("amenityModal");
  const addAmenityBtn = document.getElementById("addAmenityBtn");
  const amenityForm = document.getElementById("amenityForm");

  if (addAmenityBtn && amenityModal && amenityForm) {
    addAmenityBtn.addEventListener(
      "click",
      () => (amenityModal.style.display = "flex")
    );
    amenityForm
      .querySelector(".close-btn")
      .addEventListener("click", () => (amenityModal.style.display = "none"));
    amenityForm.addEventListener("submit", (e) => {
      e.preventDefault();
      addNotification("New amenity added!");
      amenityModal.style.display = "none";
      amenityForm.reset();
    });
  }

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
      const packageName = t.packageName || "N/A";
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
        <td>${packageName}</td>
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

    feedbacks.forEach(feedback => {
      const feedbackCard = document.createElement("div");
      feedbackCard.className = "feedback-card";
      
      // Star rating
      const stars = '⭐'.repeat(feedback.rating) + '☆'.repeat(5 - feedback.rating);
      
      feedbackCard.innerHTML = `
        <div class="feedback-header">
          <strong>${feedback.guestName || 'Anonymous'}</strong>
          <span class="feedback-date">${new Date(feedback.createdAt).toLocaleDateString()}</span>
        </div>
        <div class="feedback-rating">${stars}</div>
        <div class="feedback-comments">${feedback.comments}</div>
        ${feedback.packageName ? `<div class="feedback-booking">Package: ${feedback.packageName}</div>` : ''}
      `;
      
      feedbacksList.appendChild(feedbackCard);
    });
  } catch (err) {
    console.error("❌ Error loading feedbacks:", err);
  }
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
      if (booking.bookingID && booking.packageName) {
        const option = document.createElement("option");
        option.value = booking.bookingID;
        option.textContent = `${booking.bookingID} - ${booking.packageName}`;
        bookingSelect.appendChild(option);
      }
    });
  } catch (err) {
    console.error("❌ Error loading guests:", err);
  }
}
