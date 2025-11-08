// ===== BOOKING SYSTEM WITH DATABASE-DRIVEN PACKAGES =====
(() => {
  // DOM ELEMENTS
  const overlay = document.getElementById("overlay");
  const modal = document.getElementById("book-modal");
  const bookingModal = document.querySelector(".booking-modal");
  const packageSection = document.getElementById("modal-package-selection");
  const formSection = document.getElementById("modal-booking-form");
  const packageCardsContainer = document.querySelector(".modal-packages-row");
  const cancelBooking = document.getElementById("cancelBooking");
  const bookingForm = document.getElementById("bookingForm");

  // FORM DISPLAY ELEMENTS
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

  // PRICE CONSTANTS (fallback)
  const PRICE_PER_PERSON = 150;
  const PRICE_PER_HOUR = 500;

  // ===== PACKAGE MANAGEMENT =====
  let currentPackages = [];

  // Fetch packages from database
  async function fetchPackages() {
    try {
      const res = await fetch("http://localhost:3000/admin/packages");
      if (res.ok) {
        const packages = await res.json();
        return packages;
      }
    } catch (err) {
      console.warn("Failed to fetch packages:", err);
    }
    return [];
  }

  // Render package cards in modal
  function renderPackageCards(packages) {
    if (!packageCardsContainer) return;
    
    packageCardsContainer.innerHTML = "";

    packages.forEach(pkg => {
      const card = document.createElement("div");
      card.className = "modal-package-card";
      
      // Determine package type and set appropriate data
      const packageType = pkg.packageType.toLowerCase();
      let duration = "same-day";
      let optionATime = "";
      let optionBTime = "";

      if (packageType.includes("daytime")) {
        duration = "same-day";
      } else if (packageType.includes("overnight")) {
        duration = "next-day";
      } else if (packageType.includes("one-day")) {
        duration = "next-day";
        optionATime = "9:00 AM - 7:00 AM";
        optionBTime = "7:00 PM - 5:00 PM";
      }

      card.dataset.name = pkg.packageType;
      card.dataset.time = pkg.description;
      card.dataset.pax = pkg.paxNo;
      card.dataset.price = `₱${Number(pkg.price).toLocaleString()}`;
      card.dataset.duration = duration;
      card.dataset.optionATime = optionATime;
      card.dataset.optionBTime = optionBTime;
      card.dataset.personPrice = pkg.addPersonPrice;
      card.dataset.hourPrice = pkg.addHourPrice;

      // Use appropriate image based on package type
      let imageSrc = "../images/hero1.jpg"; // default
      if (packageType.includes("overnight")) imageSrc = "../images/hero2.jpg";
      if (packageType.includes("one-day")) imageSrc = "../images/hero3.jpg";

      card.innerHTML = `
        <img src="${imageSrc}" alt="${pkg.packageType}" />
        <div class="modal-package-info">
          <h3>${pkg.packageType.replace(/ Package/gi, '')}</h3>
          <p>${pkg.description}</p>
          <p>${pkg.paxNo} PAX Maximum</p>
          <p class="price">₱${Number(pkg.price).toLocaleString()}</p>
          <button class="choose-package-btn">Choose</button>
        </div>
      `;

      packageCardsContainer.appendChild(card);
    });

    // Re-attach event listeners to new cards
    attachPackageCardEvents();
  }

  // Update main page package cards
  function updateMainPackageCards(packages) {
    const mainPackageCards = document.querySelectorAll(".package-card");
    
    packages.forEach((pkg, index) => {
      if (mainPackageCards[index]) {
        const card = mainPackageCards[index];
        const totalElement = card.querySelector(".total");
        const paxElement = card.querySelector(".pax");
        
        if (totalElement) {
          totalElement.textContent = `₱${Number(pkg.price).toLocaleString()}`;
        }
        if (paxElement) {
          paxElement.textContent = `${pkg.paxNo} PAX Maximum`;
        }
        
        // Update add-on prices
        const addonPrices = card.querySelectorAll(".addon-price");
        if (addonPrices[0]) {
          addonPrices[0].textContent = `₱${Number(pkg.addPersonPrice).toLocaleString()}`;
        }
        if (addonPrices[1]) {
          addonPrices[1].textContent = `₱${Number(pkg.addHourPrice).toLocaleString()}`;
        }
      }
    });
  }

  // ✅ UPDATE ADD-ON PRICES DISPLAY IN BOOKING FORM
  function updateAddOnPricesDisplay(personPrice, hourPrice) {
    // Update labels to show current prices
    const addPaxLabel = document.querySelector('label[for="additional-pax"]');
    const addHoursLabel = document.querySelector('label[for="additional-hours"]');
    
    if (addPaxLabel) {
      addPaxLabel.textContent = `Additional Person (₱${personPrice.toLocaleString()} each)`;
    }
    
    if (addHoursLabel) {
      addHoursLabel.textContent = `Additional Hour(s) (₱${hourPrice.toLocaleString()} each)`;
    }
  }

  // Load and initialize packages
  async function loadPackages() {
    const packages = await fetchPackages();
    currentPackages = packages;
    
    if (packages.length > 0) {
      renderPackageCards(packages);
      updateMainPackageCards(packages);
      
      // ✅ UPDATE ADD-ON PRICES IF BOOKING MODAL IS OPEN
      if (modal.classList.contains("show") && packageNameEl.textContent) {
        const currentPackage = packages.find(pkg => 
          pkg.packageType === packageNameEl.textContent + ' Package'
        );
        
        if (currentPackage) {
          updateAddOnPricesDisplay(currentPackage.addPersonPrice, currentPackage.addHourPrice);
          computeTotal(); // Recalculate with new prices
        }
      }
    }
  }

  // ===== USER AUTHENTICATION CHECK =====
  async function checkLoginStatus() {
    try {
      const res = await fetch("/api/check-session", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.loggedIn) return true;
      }
    } catch (err) {
      console.warn("Backend login check failed:", err);
    }
    const loggedIn = localStorage.getItem("isLoggedIn");
    return loggedIn === "true";
  }

  // ===== UTILITY FUNCTIONS =====
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
    const base = Number(bookingModal.dataset.currentBase || parsePriceString(basePriceEl.value));
    const addPax = Number(additionalPaxEl.value) || 0;
    const addHrs = Number(additionalHoursEl.value) || 0;
    
    // ✅ GET CURRENT PACKAGE TO USE CORRECT ADD-ON PRICES
    const currentPackage = currentPackages.find(pkg => 
      pkg.packageType === packageNameEl.textContent + ' Package'
    );
    
    const personPrice = currentPackage ? currentPackage.addPersonPrice : PRICE_PER_PERSON;
    const hourPrice = currentPackage ? currentPackage.addHourPrice : PRICE_PER_HOUR;
    
    const total = base + addPax * personPrice + addHrs * hourPrice;
    totalPriceEl.value = formatPHP(total);
    basePriceEl.value = formatPHP(base);
  }

  // ===== MODAL CONTROL FUNCTIONS =====
  function openModal() {
    modal.classList.add("show");
    bookingModal.classList.remove("step2");
    packageSection.style.display = "block";
    formSection.style.display = "none";
    document.body.classList.add("modal-open");
    
    // Refresh packages when modal opens
    loadPackages();
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

  // ===== PACKAGE CARD EVENT HANDLERS =====
  function attachPackageCardEvents() {
    document.querySelectorAll(".modal-package-card").forEach((card) => {
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
        const personPrice = Number(card.dataset.personPrice) || PRICE_PER_PERSON;
        const hourPrice = Number(card.dataset.hourPrice) || PRICE_PER_HOUR;

        packageNameEl.textContent = name.replace(/ Package/gi, ''); 
        packageTimeEl.textContent = time;
        packagePaxEl.textContent = `${pax} PAX Maximum`;
        packagePriceEl.textContent = price;
        packageImageEl.src = card.querySelector("img").src;

        const baseNum = parsePriceString(price);
        basePriceEl.value = formatPHP(baseNum);
        bookingModal.dataset.currentBase = baseNum;

        // ✅ UPDATE ADD-ON PRICES DISPLAY
        updateAddOnPricesDisplay(personPrice, hourPrice);

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
          setCheckoutDateFrom(checkinDateEl.value, bookingModal.dataset.currentDuration);
        }
      });
    });
  }

  // ===== BOOK NOW BUTTON EVENT HANDLER =====
  document.querySelectorAll(".book-now").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const isLoggedIn = await checkLoginStatus();
      if (!isLoggedIn) {
        alert("⚠️ Please log in first before booking.");
        const loginModal = document.getElementById("login-modal");
        if (loginModal) loginModal.style.display = "flex";
        return;
      }
      openModal();
    });
  });

  // ===== FORM EVENT HANDLERS =====
  oneDayOptionSelect.addEventListener("change", () => {
    const selectedText = oneDayOptionSelect.options[oneDayOptionSelect.selectedIndex].text;
    const parts = selectedText.split(" - ");
    checkinTimeEl.value = parts[0] ? parts[0].trim() : "";
    checkoutTimeEl.value = parts[1] ? parts[1].trim() : "";
    bookingModal.dataset.currentDuration = "next-day";
    if (checkinDateEl.value) {
      setCheckoutDateFrom(checkinDateEl.value, bookingModal.dataset.currentDuration);
    }
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

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // ===== FORM SUBMISSION TO BACKEND =====
  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const guestID = localStorage.getItem("guestID");
    if (!guestID) {
      alert("⚠️ Please log in first.");
      return;
    }

    const bookingData = {
      guestID,
      packageName: packageNameEl.textContent,
      checkinDate: checkinDateEl.value,
      checkoutDate: checkoutDateEl.value,
      checkinTime: checkinTimeEl.value,
      checkoutTime: checkoutTimeEl.value,
      numGuests: Number(numGuestsEl.value) || 0,
      additionalPax: Number(additionalPaxEl.value) || 0,
      additionalHours: Number(additionalHoursEl.value) || 0,
      basePrice: Number(bookingModal.dataset.currentBase || 0),
      totalPrice: parseFloat(totalPriceEl.value.replace(/[^0-9.]/g, "")) || 0,
    };

    try {
      const response = await fetch("/api/bookings/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();
      if (response.ok) {
        alert("✅ " + result.message);
        closeModal();
        bookingForm.reset();
      } else {
        alert("❌ " + result.message);
      }
    } catch (err) {
      console.error("Booking submit error:", err);
      alert("⚠️ Something went wrong while saving your booking.");
    }
  });

  // ===== INITIALIZATION =====
  // Load packages when page loads
  document.addEventListener("DOMContentLoaded", () => {
    loadPackages();
  });

  // Auto-refresh packages every 30 seconds to get updates from admin
  setInterval(() => {
    loadPackages();
  }, 30000);

})();