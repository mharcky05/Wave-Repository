<<<<<<< HEAD
// ===== BOOK-NOW SCRIPT (with Login Check) =====
=======
// ===== MODAL SCRIPTS =====
>>>>>>> 63b505a63800a278b92ce2b08dff24423b63d8a7
(() => {
  // ----- BOOK NOW -----
  const modal = document.getElementById("book-modal");
  const bookingModal = document.querySelector(".booking-modal");
  const packageSection = document.getElementById("modal-package-selection");
  const formSection = document.getElementById("modal-booking-form");
  const packageCards = document.querySelectorAll(".modal-package-card");
  const cancelBooking = document.getElementById("cancelBooking");

  const packageNameEl = document.getElementById("selected-package-name");
  const packageTimeEl = document.getElementById("selected-package-time");
  const packagePaxEl = document.getElementById("selected-package-pax");
  const packagePriceEl = document.getElementById("selected-package-price");
  const packageImageEl = document.getElementById("selected-package-image");
  const checkinDateEl = document.getElementById("checkin-date");
  const checkoutDateEl = document.getElementById("checkout-date");
  const checkinTimeEl = document.getElementById("checkin-time");
  const checkoutTimeEl = document.getElementById("checkout-time");
  const numGuestsEl = document.getElementById("num-guests");
  const additionalPaxEl = document.getElementById("additional-pax");
  const additionalHoursEl = document.getElementById("additional-hours");
  const basePriceEl = document.getElementById("base-price");
  const totalPriceEl = document.getElementById("total-price");
  const oneDayOptionRow = document.getElementById("one-day-option-row");
  const oneDayOptionSelect = document.getElementById("one-day-option");

  const PRICE_PER_PERSON = 150;
  const PRICE_PER_HOUR = 500;

<<<<<<< HEAD
  // ========== LOGIN CHECK ==========
  async function checkLoginStatus() {
    try {
      // Try backend check (if you have /api/check-session)
      const res = await fetch("/api/check-session", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.loggedIn) return true;
      }
    } catch (err) {
      console.warn("Backend login check failed:", err);
    }

    // Fallback: localStorage-based login (for front-end testing)
    const loggedIn = localStorage.getItem("isLoggedIn");
    return loggedIn === "true";
  }

  // Helpers
  function parsePriceString(p) {
    if (!p) return 0;
    const n = p.replace(/[^0-9.]/g, "");
    return Number(n) || 0;
=======
  function parsePriceString(p) {
    if (!p) return 0;
    return Number(p.replace(/[^0-9.]/g, "")) || 0;
>>>>>>> 63b505a63800a278b92ce2b08dff24423b63d8a7
  }

  function formatPHP(n) {
    return "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 0 });
  }

  function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function setCheckoutDateFrom(checkinDateStr, duration) {
    if (!checkinDateStr) {
      checkoutDateEl.value = "";
      return;
    }
<<<<<<< HEAD
    checkoutDateEl.value = (duration === "same-day")
      ? checkinDateStr
      : addDays(checkinDateStr, 1);
=======
    checkoutDateEl.value = duration === "same-day" ? checkinDateStr : addDays(checkinDateStr, 1);
>>>>>>> 63b505a63800a278b92ce2b08dff24423b63d8a7
  }

  function computeTotal() {
    const base = Number(bookingModal.dataset.currentBase || parsePriceString(basePriceEl.value));
    const addPax = Number(additionalPaxEl.value) || 0;
    const addHrs = Number(additionalHoursEl.value) || 0;
<<<<<<< HEAD
    const total = base + (addPax * PRICE_PER_PERSON) + (addHrs * PRICE_PER_HOUR);
    totalPriceEl.value = "₱" + total.toLocaleString("en-PH", { minimumFractionDigits: 0 });
  }

  // Open modal
=======
    totalPriceEl.value = formatPHP(base + (addPax * PRICE_PER_PERSON) + (addHrs * PRICE_PER_HOUR));
  }

>>>>>>> 63b505a63800a278b92ce2b08dff24423b63d8a7
  function openModal() {
    modal.classList.add("show");
    bookingModal.classList.remove("step2");
    packageSection.style.display = "block";
    formSection.style.display = "none";
    document.body.classList.add("modal-open");
  }

<<<<<<< HEAD
  // Close modal
=======
>>>>>>> 63b505a63800a278b92ce2b08dff24423b63d8a7
  function closeModal() {
    modal.classList.remove("show");
    bookingModal.classList.remove("step2");
    packageSection.style.display = "block";
    formSection.style.display = "none";
    document.body.classList.remove("modal-open");
<<<<<<< HEAD
=======

>>>>>>> 63b505a63800a278b92ce2b08dff24423b63d8a7
    additionalPaxEl.value = 0;
    additionalHoursEl.value = 0;
    basePriceEl.value = "";
    totalPriceEl.value = "";
    checkinDateEl.value = "";
    checkoutDateEl.value = "";
    oneDayOptionRow.style.display = "none";
    oneDayOptionSelect.innerHTML = "";
  }

<<<<<<< HEAD

  // ========= CHECK LOGIN STATUS =========
function checkLoginStatus() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  return isLoggedIn;
}


 // ========= BOOK NOW BUTTON BEHAVIOR =========
document.querySelectorAll(".book-now").forEach(btn => {
  btn.addEventListener("click", async (e) => {
    e.preventDefault();

    // Check login before opening modal
    const isLoggedIn = await checkLoginStatus();
    if (!isLoggedIn) {
      alert("⚠️ Please log in first before booking.");

      // ✅ show login modal instead of redirecting
      setTimeout(() => {
        const loginModal = document.getElementById("login-modal");
        if (loginModal) {
          loginModal.style.display = "flex";
        } else {
          console.error("⚠️ login-modal not found!");
        }
      }, 300);

      return;
    }

    openModal();
  });
});


  // ========= PACKAGE SELECTION =========
  packageCards.forEach(card => {
    const btn = card.querySelector(".choose-package-btn");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();

=======
  document.querySelectorAll(".book-now").forEach(btn => btn.addEventListener("click", openModal));

  packageCards.forEach(card => {
    const btn = card.querySelector(".choose-package-btn");
    btn.addEventListener("click", () => {
>>>>>>> 63b505a63800a278b92ce2b08dff24423b63d8a7
      const name = card.dataset.name || "";
      const time = card.dataset.time || "";
      const pax = card.dataset.pax || "";
      const price = card.dataset.price || "";
      const duration = card.dataset.duration || "same-day";
<<<<<<< HEAD
      const aTime = card.dataset.optionATime || card.dataset["option-a-time"];
      const bTime = card.dataset.optionBTime || card.dataset["option-b-time"];
=======
>>>>>>> 63b505a63800a278b92ce2b08dff24423b63d8a7

      packageNameEl.textContent = name;
      packageTimeEl.textContent = time;
      packagePaxEl.textContent = `${pax} PAX Maximum`;
      packagePriceEl.textContent = price;
      packageImageEl.src = card.querySelector("img").src;

      const baseNum = parsePriceString(price);
      basePriceEl.value = formatPHP(baseNum);
      bookingModal.dataset.currentBase = baseNum;
<<<<<<< HEAD

      // Handle time options
      if (aTime && bTime) {
        oneDayOptionRow.style.display = "block";
        oneDayOptionSelect.innerHTML = "";
        const optA = document.createElement("option");
        optA.value = "a";
        optA.textContent = aTime;
        const optB = document.createElement("option");
        optB.value = "b";
        optB.textContent = bTime;
        oneDayOptionSelect.appendChild(optA);
        oneDayOptionSelect.appendChild(optB);
        const selectedTime = aTime.split(" - ");
        checkinTimeEl.value = selectedTime[0] || "";
        checkoutTimeEl.value = selectedTime[1] || "";
        bookingModal.dataset.currentDuration = "next-day";
      } else {
        oneDayOptionRow.style.display = "none";
        const timeParts = time.split(" - ");
        checkinTimeEl.value = timeParts[0] || "";
        checkoutTimeEl.value = timeParts[1] || "";
        bookingModal.dataset.currentDuration = duration;
      }

      numGuestsEl.value = pax;
      additionalPaxEl.value = 0;
      additionalHoursEl.value = 0;
=======
      bookingModal.dataset.currentDuration = duration;

      numGuestsEl.value = pax;
      additionalPaxEl.value = 0;
      additionalHoursEl.value = 0;

      // Handle One-Day dropdown
      if (card.dataset.optionATime && card.dataset.optionBTime) {
        oneDayOptionRow.style.display = "block";
        oneDayOptionSelect.innerHTML = "";
        const optA = document.createElement("option");
        optA.value = "option-a";
        optA.textContent = card.dataset.optionATime;
        const optB = document.createElement("option");
        optB.value = "option-b";
        optB.textContent = card.dataset.optionBTime;
        oneDayOptionSelect.appendChild(optA);
        oneDayOptionSelect.appendChild(optB);

        const selectedTime = oneDayOptionSelect.value === "option-a" ? card.dataset.optionATime : card.dataset.optionBTime;
        checkinTimeEl.value = selectedTime.split(" - ")[0] || selectedTime;
        checkoutTimeEl.value = selectedTime.split(" - ")[1] || "";
        bookingModal.dataset.currentDuration = "next-day";
      } else {
        oneDayOptionRow.style.display = "none";
        checkinTimeEl.value = time.split(" - ")[0] || time;
        checkoutTimeEl.value = time.split(" - ")[1] || "";
      }

>>>>>>> 63b505a63800a278b92ce2b08dff24423b63d8a7
      computeTotal();

      packageSection.style.display = "none";
      formSection.style.display = "block";
      bookingModal.classList.add("step2");
<<<<<<< HEAD

      modal.classList.add("show");
      document.body.classList.add("modal-open");

      if (checkinDateEl.value) {
        setCheckoutDateFrom(checkinDateEl.value, bookingModal.dataset.currentDuration);
      }
    });
  });

  // ========= OPTION CHANGE & FORM EVENTS =========
=======
    });
  });

>>>>>>> 63b505a63800a278b92ce2b08dff24423b63d8a7
  oneDayOptionSelect.addEventListener("change", () => {
    const selectedText = oneDayOptionSelect.options[oneDayOptionSelect.selectedIndex].text;
    const parts = selectedText.split(" - ");
    checkinTimeEl.value = parts[0] ? parts[0].trim() : "";
    checkoutTimeEl.value = parts[1] ? parts[1].trim() : "";
    bookingModal.dataset.currentDuration = "next-day";
<<<<<<< HEAD
    if (checkinDateEl.value) {
      setCheckoutDateFrom(checkinDateEl.value, bookingModal.dataset.currentDuration);
    }
=======
    if (checkinDateEl.value) setCheckoutDateFrom(checkinDateEl.value, bookingModal.dataset.currentDuration);
>>>>>>> 63b505a63800a278b92ce2b08dff24423b63d8a7
  });

  checkinDateEl.addEventListener("change", (e) => {
    setCheckoutDateFrom(e.target.value, bookingModal.dataset.currentDuration || "same-day");
  });

  additionalPaxEl.addEventListener("input", computeTotal);
  additionalHoursEl.addEventListener("input", computeTotal);

  cancelBooking.addEventListener("click", (e) => {
    e.preventDefault();
    formSection.style.display = "none";
    packageSection.style.display = "block";
    bookingModal.classList.remove("step2");
    oneDayOptionRow.style.display = "none";
  });

<<<<<<< HEAD
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // ========= FORM SUBMIT =========
=======
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });

>>>>>>> 63b505a63800a278b92ce2b08dff24423b63d8a7
  const bookingForm = document.getElementById("bookingForm");
  bookingForm.addEventListener("submit", e => {
    e.preventDefault();
    const payload = {
      package: packageNameEl.textContent,
      checkin_date: checkinDateEl.value,
      checkout_date: checkoutDateEl.value,
      checkin_time: checkinTimeEl.value,
      checkout_time: checkoutTimeEl.value,
      pax_max: numGuestsEl.value,
      additional_persons: Number(additionalPaxEl.value) || 0,
      additional_hours: Number(additionalHoursEl.value) || 0,
      base_price: Number(bookingModal.dataset.currentBase || 0),
      total_price: totalPriceEl.value,
      remarks: document.getElementById("remarks").value || ""
    };
<<<<<<< HEAD

    console.log("Booking payload:", payload);
=======
    console.log("Booking payload:", payload);
    closeModal();
>>>>>>> 63b505a63800a278b92ce2b08dff24423b63d8a7
    alert("Booking request submitted (demo). Check console for payload.");
    closeModal();
  });
<<<<<<< HEAD
=======

  // ----- AMENITIES -----
  const viewAllCard = document.querySelector(".view-all-card");
  const amenitiesModal = document.getElementById("amenities-modal");
  const closeAmenities = document.getElementById("closeAmenities");

  if (viewAllCard) viewAllCard.addEventListener("click", () => amenitiesModal.classList.add("active"));
  if (closeAmenities) closeAmenities.addEventListener("click", () => amenitiesModal.classList.remove("active"));
  window.addEventListener("click", e => { if (e.target === amenitiesModal) amenitiesModal.classList.remove("active"); });

>>>>>>> 63b505a63800a278b92ce2b08dff24423b63d8a7
})();
