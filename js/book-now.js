// ===== BOOK-NOW SCRIPT (with Login Check) =====
(() => {
  // Elements
  const overlay = document.getElementById("overlay");
  const modal = document.getElementById("book-modal");
  const bookingModal = document.querySelector(".booking-modal");
  const packageSection = document.getElementById("modal-package-selection");
  const formSection = document.getElementById("modal-booking-form");
  const packageCards = document.querySelectorAll(".modal-package-card");
  const cancelBooking = document.getElementById("cancelBooking");

  // display elements in form
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

  // constants
  const PRICE_PER_PERSON = 150;
  const PRICE_PER_HOUR = 500;

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
    checkoutDateEl.value =
      duration === "same-day" ? checkinDateStr : addDays(checkinDateStr, 1);
  }

  function computeTotal() {
    const base =
      Number(bookingModal.dataset.currentBase || parsePriceString(basePriceEl.value));
    const addPax = Number(additionalPaxEl.value) || 0;
    const addHrs = Number(additionalHoursEl.value) || 0;
    const total = base + addPax * PRICE_PER_PERSON + addHrs * PRICE_PER_HOUR;
    totalPriceEl.value = formatPHP(total);
  }

  // Open modal
  function openModal() {
    modal.classList.add("show");
    bookingModal.classList.remove("step2");
    packageSection.style.display = "block";
    formSection.style.display = "none";
    document.body.classList.add("modal-open");
  }

  // Close modal
  function closeModal() {
    modal.classList.remove("show");
    bookingModal.classList.remove("step2");
    packageSection.style.display = "block";
    formSection.style.display = "none";
    document.body.classList.remove("modal-open");
    additionalPaxEl.value = 0;
    additionalHoursEl.value = 0;
    basePriceEl.value = "";
    totalPriceEl.value = "";
    checkinDateEl.value = "";
    checkoutDateEl.value = "";
    oneDayOptionRow.style.display = "none";
    oneDayOptionSelect.innerHTML = "";
  }

  // ========= BOOK NOW BUTTON BEHAVIOR =========
  document.querySelectorAll(".book-now").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();

      // Check login before opening modal
      const isLoggedIn = await checkLoginStatus();
      if (!isLoggedIn) {
        alert("⚠️ Please log in first before booking.");

        // ✅ Show login modal instead of redirecting
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
  packageCards.forEach((card) => {
    const btn = card.querySelector(".choose-package-btn");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      const name = card.dataset.name || "";
      const time = card.dataset.time || "";
      const pax = card.dataset.pax || "";
      const price = card.dataset.price || "";
      const duration = card.dataset.duration || "same-day";
      const aTime = card.dataset.optionATime || card.dataset["option-a-time"];
      const bTime = card.dataset.optionBTime || card.dataset["option-b-time"];

      packageNameEl.textContent = name;
      packageTimeEl.textContent = time;
      packagePaxEl.textContent = `${pax} PAX Maximum`;
      packagePriceEl.textContent = price;
      packageImageEl.src = card.querySelector("img").src;

      const baseNum = parsePriceString(price);
      basePriceEl.value = formatPHP(baseNum);
      bookingModal.dataset.currentBase = baseNum;

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
      computeTotal();

      packageSection.style.display = "none";
      formSection.style.display = "block";
      bookingModal.classList.add("step2");

      modal.classList.add("show");
      document.body.classList.add("modal-open");

      if (checkinDateEl.value) {
        setCheckoutDateFrom(
          checkinDateEl.value,
          bookingModal.dataset.currentDuration
        );
      }
    });
  });

  // ========= OPTION CHANGE & FORM EVENTS =========
  oneDayOptionSelect.addEventListener("change", () => {
    const selectedText =
      oneDayOptionSelect.options[oneDayOptionSelect.selectedIndex].text;
    const parts = selectedText.split(" - ");
    checkinTimeEl.value = parts[0] ? parts[0].trim() : "";
    checkoutTimeEl.value = parts[1] ? parts[1].trim() : "";
    bookingModal.dataset.currentDuration = "next-day";
    if (checkinDateEl.value) {
      setCheckoutDateFrom(
        checkinDateEl.value,
        bookingModal.dataset.currentDuration
      );
    }
  });

  checkinDateEl.addEventListener("change", (e) => {
    const cd = e.target.value;
    const duration = bookingModal.dataset.currentDuration || "same-day";
    setCheckoutDateFrom(cd, duration);
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

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // ========= FORM SUBMIT =========
  const bookingForm = document.getElementById("bookingForm");
  bookingForm.addEventListener("submit", (e) => {
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
      remarks: document.getElementById("remarks").value || "",
    };

    console.log("Booking payload:", payload);
    alert("Booking request submitted (demo). Check console for payload.");
    closeModal();
  });
})();
