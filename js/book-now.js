// ===== BOOK-NOW SCRIPT (full) =====
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

  // helpers
  function parsePriceString(p) {
    if (!p) return 0;
    // remove non-digits
    const n = p.replace(/[^0-9.]/g, "");
    return Number(n) || 0;
  }

  function formatPHP(n) {
    return "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 0 });
  }

  function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    // to yyyy-mm-dd string for input[type=date]
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
    if (duration === "same-day") {
      checkoutDateEl.value = checkinDateStr;
    } else {
      checkoutDateEl.value = addDays(checkinDateStr, 1);
    }
  }

  function computeTotal() {
    const base = parsePriceString(basePriceEl.value);
    const addPax = Number(additionalPaxEl.value) || 0;
    const addHours = Number(additionalHoursEl.value) || 0;
    const total = base + (addPax * PRICE_PER_PERSON) + (addHours * PRICE_PER_HOUR);
    totalPriceEl.value = formatPHP(total);
  }

  // open modal: also wired to .book-now buttons across the page
  function openModal() {
    modal.classList.add("show");
    bookingModal.classList.remove("step2");
    packageSection.style.display = "block";
    formSection.style.display = "none";
    document.body.classList.add("modal-open");
  }

  // close modal fully and reset to step1
  function closeModal() {
    modal.classList.remove("show");
    bookingModal.classList.remove("step2");
    packageSection.style.display = "block";
    formSection.style.display = "none";
    document.body.classList.remove("modal-open");
    // reset one-day option
    oneDayOptionRow.style.display = "none";
    oneDayOptionSelect.selectedIndex = 0;
  }

  // wire all Book Now triggers (existing .book-now)
  document.querySelectorAll(".book-now").forEach(btn => {
    btn.addEventListener("click", openModal);
  });

  // package choose behavior
  packageCards.forEach(card => {
    const btn = card.querySelector(".choose-package-btn");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      // gather package info from card's data attributes
      const name = card.dataset.name || "";
      const time = card.dataset.time || "";
      const pax = card.dataset.pax || "";
      const price = card.dataset.price || "";
      const duration = card.dataset.duration || "same-day"; // same-day or next-day
      const optA = card.dataset.optionATime || card.dataset.optionA || card.dataset.optionA || card.dataset.optionATime || card.dataset.optionA; // fallback
      // we set explicitly below via dataset fields used in HTML: data-option-a-time and data-option-b-time
      const optionATime = card.dataset.optionATime || card.dataset.optionATime || card.dataset.optionA || card.dataset.optionATime || card.dataset.optionA;
      const optionBTime = card.dataset.optionBTime || card.dataset.optionBTime || card.dataset.optionB || card.dataset.optionBTime || card.dataset.optionB;

      // populate the form UI
      packageNameEl.textContent = name;
      packageTimeEl.textContent = time;
      packagePaxEl.textContent = `${pax} PAX Maximum`;
      packagePriceEl.textContent = price;
      packageImageEl.src = card.querySelector("img").src;

      // base price (plain number) shown in basePriceEl (readonly text)
      const baseNum = parsePriceString(price);
      basePriceEl.value = formatPHP(baseNum);

      // set times and pax readonly fields
      // For One-Day package (we used data-option-a-time and data-option-b-time in HTML),
      // show dropdown so user can pick the time option
      if (card.dataset.optionA && card.dataset.optionB) {
        // handled if attributes were set as data-option-a & data-option-b (fallback)
      }
      // Check if the card has option-a and option-b attributes (we used data-option-a-time and data-option-b-time)
      const hasOneDayOptions = !!(card.dataset.optionATime || card.dataset.optionATime || card.dataset.optionA || card.dataset["option-a-time"] || card.dataset["option-b-time"]);

      // Show or hide the one-day dropdown
      if (hasOneDayOptions) {
        // try to read them reliably (using the names included in our HTML: data-option-a-time and data-option-b-time)
        const aTime = card.dataset.optionATime || card.dataset.optionA || card.dataset["option-a-time"] || card.dataset.optionATime || card.dataset.optionA;
        const bTime = card.dataset.optionBTime || card.dataset.optionB || card.dataset["option-b-time"] || card.dataset.optionBTime || card.dataset.optionB;
        // put them into select options (if values present)
        // Normalize: set select options text and values:
        // option-a = first, option-b = second
        if (aTime && bTime) {
          oneDayOptionRow.style.display = "block";
          oneDayOptionSelect.innerHTML = ""; // clear
          const optElemA = document.createElement("option");
          optElemA.value = "option-a";
          optElemA.textContent = aTime;
          const optElemB = document.createElement("option");
          optElemB.value = "option-b";
          optElemB.textContent = bTime;
          oneDayOptionSelect.appendChild(optElemA);
          oneDayOptionSelect.appendChild(optElemB);

          // set initial times based on option selected
          const selectedVal = oneDayOptionSelect.value || "option-a";
          const selectedTime = (selectedVal === "option-a") ? aTime : bTime;
          checkinTimeEl.value = selectedTime.split(" - ")[0] || selectedTime;
          checkoutTimeEl.value = selectedTime.split(" - ")[1] || "";
          // duration for checkout date: next-day (we'll treat both as next-day)
          // store duration state on bookingModal for later reference
          bookingModal.dataset.currentDuration = "next-day";
        } else {
          // fallback: treat as normal package without options
          oneDayOptionRow.style.display = "none";
          checkinTimeEl.value = time.split(" - ")[0] || time;
          checkoutTimeEl.value = time.split(" - ")[1] || "";
          bookingModal.dataset.currentDuration = duration;
        }
      } else {
        // no options -> hide dropdown
        oneDayOptionRow.style.display = "none";
        checkinTimeEl.value = time.split(" - ")[0] || time;
        checkoutTimeEl.value = time.split(" - ")[1] || "";
        bookingModal.dataset.currentDuration = duration;
      }

      // set number of guests (max) and make readonly
      numGuestsEl.value = pax;

      // initialize additional inputs
      additionalPaxEl.value = 0;
      additionalHoursEl.value = 0;

      // compute total initially
      computeTotal();

      // set a data attribute current-base for easier computations
      bookingModal.dataset.currentBase = baseNum;

      // show step 2 UI
      packageSection.style.display = "none";
      formSection.style.display = "block";
      bookingModal.classList.add("step2");

      // open modal if not already
      modal.classList.add("show");
      document.body.classList.add("modal-open");

      // if check-in date already selected, update checkout accordingly
      if (checkinDateEl.value) {
        setCheckoutDateFrom(checkinDateEl.value, bookingModal.dataset.currentDuration);
      }
    });
  });

  // One-day option change handler
  oneDayOptionSelect.addEventListener("change", () => {
    // get selected option text
    const selectedText = oneDayOptionSelect.options[oneDayOptionSelect.selectedIndex].text;
    // expected format "9:00 AM - 7:00 AM"
    const parts = selectedText.split(" - ");
    checkinTimeEl.value = parts[0] ? parts[0].trim() : "";
    checkoutTimeEl.value = parts[1] ? parts[1].trim() : "";
    // For one-day both options are next-day types
    bookingModal.dataset.currentDuration = "next-day";
    // if checkin date already set, update checkout
    if (checkinDateEl.value) {
      setCheckoutDateFrom(checkinDateEl.value, bookingModal.dataset.currentDuration);
    }
  });

  // When user changes checkin date -> auto update checkout date based on current package duration
  checkinDateEl.addEventListener("change", (e) => {
    const cd = e.target.value;
    const duration = bookingModal.dataset.currentDuration || "same-day";
    setCheckoutDateFrom(cd, duration);
  });

  // Additional pax/hours change -> recompute total
  additionalPaxEl.addEventListener("input", computeTotal);
  additionalHoursEl.addEventListener("input", computeTotal);

  // computeTotal utility uses basePriceEl.value, so make sure it's set as numeric text (we set basePriceEl as formatted)
  // but computeTotal uses parsePriceString on basePriceEl.value.

  // Cancel/back button: return to package selection
  cancelBooking.addEventListener("click", (e) => {
    e.preventDefault();
    formSection.style.display = "none";
    packageSection.style.display = "block";
    bookingModal.classList.remove("step2");
    // reset one-day row
    oneDayOptionRow.style.display = "none";
  });

  // close when clicking overlay area (outside the booking-modal)
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // helper to compute and update total: uses bookingModal.dataset.currentBase if available
  function computeTotal() {
    const base = Number(bookingModal.dataset.currentBase || parsePriceString(basePriceEl.value));
    const addPax = Number(additionalPaxEl.value) || 0;
    const addHrs = Number(additionalHoursEl.value) || 0;
    const total = base + (addPax * 150) + (addHrs * 500);
    totalPriceEl.value = "₱" + total.toLocaleString("en-PH", { minimumFractionDigits: 0 });
  }

  // on form submit (example behavior)
  const bookingForm = document.getElementById("bookingForm");
  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // Here you can gather data and send to server
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

    // For now we'll just log and close modal — replace with actual submit logic
    console.log("Booking payload:", payload);
    // close modal
    closeModal();
    alert("Booking request submitted (demo). Check console for payload.");
  });

  function closeModal() {
    modal.classList.remove("show");
    bookingModal.classList.remove("step2");
    packageSection.style.display = "block";
    formSection.style.display = "none";
    document.body.classList.remove("modal-open");
    // reset some fields
    additionalPaxEl.value = 0;
    additionalHoursEl.value = 0;
    basePriceEl.value = "";
    totalPriceEl.value = "";
    checkinDateEl.value = "";
    checkoutDateEl.value = "";
    oneDayOptionRow.style.display = "none";
    oneDayOptionSelect.innerHTML = "";
  }

  // small safety: when modal opens via book-now from other places, ensure overlay element exists
  // your page already has #overlay div earlier; we used #book-modal as backdrop. If you want to use overlay separately, we can wire it too.

})();
