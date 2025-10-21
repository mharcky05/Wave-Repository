// ===== MODAL SCRIPTS =====
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

  function parsePriceString(p) {
    if (!p) return 0;
    return Number(p.replace(/[^0-9.]/g, "")) || 0;
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
    checkoutDateEl.value = duration === "same-day" ? checkinDateStr : addDays(checkinDateStr, 1);
  }

  function computeTotal() {
    const base = Number(bookingModal.dataset.currentBase || parsePriceString(basePriceEl.value));
    const addPax = Number(additionalPaxEl.value) || 0;
    const addHrs = Number(additionalHoursEl.value) || 0;
    totalPriceEl.value = formatPHP(base + (addPax * PRICE_PER_PERSON) + (addHrs * PRICE_PER_HOUR));
  }

  function openModal() {
    modal.classList.add("show");
    bookingModal.classList.remove("step2");
    packageSection.style.display = "block";
    formSection.style.display = "none";
    document.body.classList.add("modal-open");
  }

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

  document.querySelectorAll(".book-now").forEach(btn => btn.addEventListener("click", openModal));

  packageCards.forEach(card => {
    const btn = card.querySelector(".choose-package-btn");
    btn.addEventListener("click", () => {
      const name = card.dataset.name || "";
      const time = card.dataset.time || "";
      const pax = card.dataset.pax || "";
      const price = card.dataset.price || "";
      const duration = card.dataset.duration || "same-day";

      packageNameEl.textContent = name;
      packageTimeEl.textContent = time;
      packagePaxEl.textContent = `${pax} PAX Maximum`;
      packagePriceEl.textContent = price;
      packageImageEl.src = card.querySelector("img").src;

      const baseNum = parsePriceString(price);
      basePriceEl.value = formatPHP(baseNum);
      bookingModal.dataset.currentBase = baseNum;
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

      computeTotal();

      packageSection.style.display = "none";
      formSection.style.display = "block";
      bookingModal.classList.add("step2");
    });
  });

  oneDayOptionSelect.addEventListener("change", () => {
    const selectedText = oneDayOptionSelect.options[oneDayOptionSelect.selectedIndex].text;
    const parts = selectedText.split(" - ");
    checkinTimeEl.value = parts[0] ? parts[0].trim() : "";
    checkoutTimeEl.value = parts[1] ? parts[1].trim() : "";
    bookingModal.dataset.currentDuration = "next-day";
    if (checkinDateEl.value) setCheckoutDateFrom(checkinDateEl.value, bookingModal.dataset.currentDuration);
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

  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });

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
    console.log("Booking payload:", payload);
    closeModal();
    alert("Booking request submitted (demo). Check console for payload.");
  });

  // ----- AMENITIES -----
  const viewAllCard = document.querySelector(".view-all-card");
  const amenitiesModal = document.getElementById("amenities-modal");
  const closeAmenities = document.getElementById("closeAmenities");

  if (viewAllCard) viewAllCard.addEventListener("click", () => amenitiesModal.classList.add("active"));
  if (closeAmenities) closeAmenities.addEventListener("click", () => amenitiesModal.classList.remove("active"));
  window.addEventListener("click", e => { if (e.target === amenitiesModal) amenitiesModal.classList.remove("active"); });

})();
