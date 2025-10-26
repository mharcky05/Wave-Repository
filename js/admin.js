document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".nav-btn");
  const sections = document.querySelectorAll(".tab-section");
  const notifBell = document.getElementById("notifBell");
  const notifDropdown = document.getElementById("notifDropdown");
  const notifCount = document.getElementById("notifCount");
  const popupContainer = document.getElementById("popupContainer");

  let notifList = [];

  // NAVIGATION
  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      tabs.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      sections.forEach(s => s.classList.remove("active"));
      document.getElementById(btn.dataset.section).classList.add("active");
    });
  });

  // NOTIFICATION DROPDOWN
  notifBell.addEventListener("click", () => {
    notifDropdown.classList.toggle("show");
    notifCount.textContent = "0";
  });

  function addNotification(message) {
    notifList.unshift(message);
    notifCount.textContent = notifList.length;

    // Update dropdown
    notifDropdown.innerHTML = notifList
      .map(msg => `<div>${msg}</div>`)
      .join("");

    // Popup effect
    const popup = document.createElement("div");
    popup.className = "popup";
    popup.textContent = message;
    popupContainer.appendChild(popup);

    setTimeout(() => {
      popup.remove();
    }, 5000);
  }

//   // Simulate new guest activity (for demo)
//   setTimeout(() => addNotification("New booking received from Juan Dela Cruz"), 2000);
//   setTimeout(() => addNotification("Feedback added by Maria Santos"), 7000);

  // PACKAGE MODAL
  const packageModal = document.getElementById("packageModal");
  const addPackageBtn = document.getElementById("addPackageBtn");
  const packageForm = document.getElementById("packageForm");

  addPackageBtn.addEventListener("click", () => (packageModal.style.display = "flex"));
  packageForm.querySelector(".close-btn").addEventListener("click", () => (packageModal.style.display = "none"));
  packageForm.addEventListener("submit", e => {
    e.preventDefault();
    addNotification("New package added!");
    packageModal.style.display = "none";
    packageForm.reset();
  });

  // AMENITY MODAL
  const amenityModal = document.getElementById("amenityModal");
  const addAmenityBtn = document.getElementById("addAmenityBtn");
  const amenityForm = document.getElementById("amenityForm");

  addAmenityBtn.addEventListener("click", () => (amenityModal.style.display = "flex"));
  amenityForm.querySelector(".close-btn").addEventListener("click", () => (amenityModal.style.display = "none"));
  amenityForm.addEventListener("submit", e => {
    e.preventDefault();
    addNotification("New amenity added!");
    amenityModal.style.display = "none";
    amenityForm.reset();
  });

  // LOGOUT
  document.getElementById("logoutBtn").addEventListener("click", () => {
    alert("Logged out successfully!");
    window.location.href = "../index.html";
  });
});



async function loadBookings() {
  try {
    const res = await fetch("http://localhost:3000/admin/bookings");
    const bookings = await res.json();

    const tableBody = document.getElementById("guestTableBody");
    tableBody.innerHTML = "";

    bookings.forEach((b) => {
      const row = `
        <tr>
          <td>${b.bookingID}</td>
          <td>${b.guestName || "N/A"}</td>
          <td>${b.packageName}</td>
          <td>${b.checkinDate} ${b.checkinTime}</td>
          <td>${b.checkoutDate} ${b.checkoutTime}</td>
          <td>${b.numGuests}</td>
          <td>${b.additionalPax || 0}</td>
          <td>${b.additionalHours || 0}</td>
          <td>${b.basePrice}</td>
          <td>${b.totalPrice}</td>
          <td>${b.status}</td>
          <td>${new Date(b.createdAt).toLocaleString()}</td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });
  } catch (err) {
    console.error("❌ Error loading bookings:", err);
  }
}

// Call this when admin opens Guest Records tab
document.getElementById("guest-records-btn").addEventListener("click", loadBookings);


// async function loadGuestRecords() {
//   try {
//     const res = await fetch("http://localhost:3000/admin/guests");
//     const guests = await res.json();

//     const tableBody = document.querySelector("#guest-records tbody");
//     tableBody.innerHTML = ""; // clear old rows

//     guests.forEach(g => {
//       const row = document.createElement("tr");
//       row.innerHTML = `
//         <td>${g.guestID}</td>
//         <td>${g.firstName} ${g.lastName}</td>
//         <td>${g.email}</td>
//         <td>${g.contactNo}</td>
//       `;
//       tableBody.appendChild(row);
//     });

//   } catch (err) {
//     console.error("❌ Failed to load guest records:", err);
//   }
// }

loadBookings();
