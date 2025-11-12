// ===== BOOKING SYSTEM - FIXED VERSION =====
console.log("🚀 Initializing Booking System...");

document.addEventListener('DOMContentLoaded', function() {
    console.log("📖 Booking System DOM Ready");
    
    // DOM ELEMENTS
    const modal = document.getElementById("book-modal");
    const bookingModal = document.querySelector(".booking-modal");
    const packageSection = document.getElementById("modal-package-selection");
    const formSection = document.getElementById("modal-booking-form");
    const packageCardsContainer = document.querySelector(".modal-packages-row");
    const cancelBooking = document.getElementById("cancelBooking");
    const bookingForm = document.getElementById("bookingForm");

    // Check if required elements exist
    if (!modal) {
        console.error("❌ Book modal not found!");
        return;
    }

    console.log("✅ Modal elements found:", {
        modal: !!modal,
        bookingModal: !!bookingModal,
        packageSection: !!packageSection,
        formSection: !!formSection
    });

    // FORM DISPLAY ELEMENTS
    const packageTypeEl = document.getElementById("selected-package-name");
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

    // STATE VARIABLES
    let currentPackages = [];
    let isModalOpen = false;

    // ===== DATE VALIDATION FUNCTIONS =====
    function initializeDateValidation() {
        console.log("📅 Initializing date validation...");
        
        if (checkinDateEl) {
            // Set minimum date to today
            const today = new Date().toISOString().split('T')[0];
            checkinDateEl.min = today;
            
            // Add input event listener for real-time validation
            checkinDateEl.addEventListener('input', validateCheckinDate);
            
            console.log("✅ Check-in date validation initialized");
        }
        
        if (checkoutDateEl) {
            // Checkout date should be readonly and auto-filled
            checkoutDateEl.readOnly = true;
            console.log("✅ Check-out date set to read-only");
        }
    }

    function validateCheckinDate() {
        if (!checkinDateEl.value) return;
        
        const selectedDate = new Date(checkinDateEl.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time part for accurate comparison
        
        if (selectedDate < today) {
            alert("❌ Cannot select past dates. Please choose today or a future date.");
            checkinDateEl.value = ''; // Clear invalid selection
            if (checkoutDateEl) checkoutDateEl.value = ''; // Clear checkout too
            return;
        }
        
        console.log("✅ Valid check-in date selected:", checkinDateEl.value);
        
        // Auto-set checkout date based on package duration
        const duration = bookingModal?.dataset.currentDuration || "same-day";
        setCheckoutDateFrom(checkinDateEl.value, duration);
    }

    function validateDates() {
        if (!checkinDateEl || !checkinDateEl.value) {
            alert("❌ Please select a check-in date.");
            return false;
        }
        
        const selectedDate = new Date(checkinDateEl.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            alert("❌ Please select a valid check-in date (today or future).");
            return false;
        }
        
        return true;
    }

    // ===== MODAL CONTROL FUNCTIONS =====
    function openModal() {
        console.log("🎯 Opening booking modal...");
        isModalOpen = true;
        modal.classList.add("show");
        document.body.classList.add("modal-open");
        
        // Reset to package selection
        if (packageSection) packageSection.style.display = "block";
        if (formSection) formSection.style.display = "none";
        if (bookingModal) bookingModal.classList.remove("step2");
        
        // Load packages
        loadPackages();
        console.log("✅ Modal opened successfully");
    }

    function closeModal() {
        console.log("🎯 Closing booking modal...");
        isModalOpen = false;
        modal.classList.remove("show");
        document.body.classList.remove("modal-open");
        
        // Reset form
        resetForm();
        console.log("✅ Modal closed successfully");
    }

    function resetForm() {
        if (additionalPaxEl) additionalPaxEl.value = "0";
        if (additionalHoursEl) additionalHoursEl.value = "0";
        if (basePriceEl) basePriceEl.value = "";
        if (totalPriceEl) totalPriceEl.value = "";
        if (checkinDateEl) checkinDateEl.value = "";
        if (checkoutDateEl) checkoutDateEl.value = "";
        if (checkinTimeEl) checkinTimeEl.value = "";
        if (checkoutTimeEl) checkoutTimeEl.value = "";
        if (numGuestsEl) numGuestsEl.value = "";
        if (oneDayOptionRow) oneDayOptionRow.style.display = "none";
        if (oneDayOptionSelect) oneDayOptionSelect.innerHTML = "";
        
        if (packageTypeEl) packageTypeEl.textContent = "";
        if (packageTimeEl) packageTimeEl.textContent = "";
        if (packagePaxEl) packagePaxEl.textContent = "";
        if (packagePriceEl) packagePriceEl.textContent = "";
    }

    // ===== BOOK NOW BUTTONS =====
    function initializeBookNowButtons() {
        console.log("🔄 Setting up Book Now buttons...");
        
        const bookNowButtons = document.querySelectorAll('.book-now');
        console.log(`Found ${bookNowButtons.length} book now buttons`);
        
        bookNowButtons.forEach((btn, index) => {
            // Remove any existing listeners by cloning
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // Add fresh event listener
            newBtn.addEventListener('click', handleBookNowClick);
            console.log(`✅ Book Now button ${index + 1} initialized`);
        });
    }

    async function handleBookNowClick(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        console.log("🎯 BOOK NOW BUTTON CLICKED!");
        
        const isLoggedIn = await checkLoginStatus();
        if (!isLoggedIn) {
            console.log("❌ User not logged in");
            alert("⚠️ Please log in first before booking.");
            const loginModal = document.getElementById("login-modal");
            if (loginModal) loginModal.style.display = "flex";
            return;
        }
        
        console.log("✅ User logged in, opening modal");
        openModal();
    }

    // ===== PACKAGE MANAGEMENT =====
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

    function renderPackageCards(packages) {
        if (!packageCardsContainer) return;
        
        packageCardsContainer.innerHTML = "";

        packages.forEach(pkg => {
            const card = document.createElement("div");
            card.className = "modal-package-card";
            
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

            // ✅ ENSURE PRICES ARE PASSED CORRECTLY WITH FALLBACK VALUES
            card.dataset.name = pkg.packageType;
            card.dataset.time = pkg.description;
            card.dataset.pax = pkg.paxNo;
            card.dataset.price = `₱${Number(pkg.price).toLocaleString()}`;
            card.dataset.duration = duration;
            card.dataset.optionATime = optionATime;
            card.dataset.optionBTime = optionBTime;
            card.dataset.personPrice = pkg.addPersonPrice || 150;
            card.dataset.hourPrice = pkg.addHourPrice || 500;

            let imageSrc = "../images/hero1.jpg";
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

        attachPackageCardEvents();
    }

    function attachPackageCardEvents() {
        document.querySelectorAll(".modal-package-card").forEach((card) => {
            const btn = card.querySelector(".choose-package-btn");
            if (btn) {
                btn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    selectPackage(card);
                });
            }
        });
    }

    // ✅ UPDATE ADD-ON PRICES DISPLAY FUNCTION
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

    function selectPackage(card) {
        console.log("🎯 Package selected");
        
        const name = card.dataset.name || "";
        const time = card.dataset.time || "";
        const pax = card.dataset.pax || "";
        const price = card.dataset.price || "";
        const duration = card.dataset.duration || "same-day";
        const aTime = card.dataset.optionATime || "";
        const bTime = card.dataset.optionBTime || "";
        // ✅ GET THE ACTUAL PRICES FROM DATASET
        const personPrice = Number(card.dataset.personPrice) || 150;
        const hourPrice = Number(card.dataset.hourPrice) || 500;

        if (packageTypeEl) packageTypeEl.textContent = name.replace(/ Package/gi, ''); 
        if (packageTimeEl) packageTimeEl.textContent = time;
        if (packagePaxEl) packagePaxEl.textContent = `${pax} PAX Maximum`;
        if (packagePriceEl) packagePriceEl.textContent = price;
        if (packageImageEl) packageImageEl.src = card.querySelector("img").src;

        const baseNum = parsePriceString(price);
        if (basePriceEl) basePriceEl.value = formatPHP(baseNum);
        if (bookingModal) {
            bookingModal.dataset.currentBase = baseNum;
            // ✅ STORE THE CURRENT PACKAGE PRICES
            bookingModal.dataset.personPrice = personPrice;
            bookingModal.dataset.hourPrice = hourPrice;
        }

        // ✅ UPDATE LABELS WITH CURRENT PRICES
        updateAddOnPricesDisplay(personPrice, hourPrice);

        if (aTime && bTime && oneDayOptionRow && oneDayOptionSelect) {
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
            if (checkinTimeEl) checkinTimeEl.value = selectedTime[0] || "";
            if (checkoutTimeEl) checkoutTimeEl.value = selectedTime[1] || "";
            if (bookingModal) bookingModal.dataset.currentDuration = "next-day";
        } else {
            if (oneDayOptionRow) oneDayOptionRow.style.display = "none";
            const timeParts = time.split(" - ");
            if (checkinTimeEl) checkinTimeEl.value = timeParts[0] || "";
            if (checkoutTimeEl) checkoutTimeEl.value = timeParts[1] || "";
            if (bookingModal) bookingModal.dataset.currentDuration = duration;
        }

        if (numGuestsEl) numGuestsEl.value = pax;
        if (additionalPaxEl) additionalPaxEl.value = "0";
        if (additionalHoursEl) additionalHoursEl.value = "0";
        
        // ✅ PASS PRICES TO COMPUTE TOTAL
        computeTotal();

        if (packageSection) packageSection.style.display = "none";
        if (formSection) formSection.style.display = "block";
        if (bookingModal) bookingModal.classList.add("step2");
        
        // ✅ RESET DATES WHEN PACKAGE CHANGES
        if (checkinDateEl) checkinDateEl.value = "";
        if (checkoutDateEl) checkoutDateEl.value = "";
        
        console.log("✅ Package selection completed");
    }

    // ✅ UPDATE MAIN PAGE PACKAGE CARDS FUNCTION
    function updateMainPackageCards(packages) {
        console.log("🔄 Updating main page package cards...");
        
        const mainPackageCards = document.querySelectorAll(".package-card");
        
        packages.forEach((pkg, index) => {
            if (mainPackageCards[index]) {
                const card = mainPackageCards[index];
                const totalElement = card.querySelector(".total");
                const paxElement = card.querySelector(".pax");
                const timeElement = card.querySelector(".time");
                
                // Update package info
                if (totalElement) {
                    totalElement.textContent = `₱${Number(pkg.price).toLocaleString()}`;
                }
                if (paxElement) {
                    paxElement.textContent = `${pkg.paxNo} PAX Maximum`;
                }
                if (timeElement) {
                    timeElement.textContent = pkg.description;
                }
                
                // ✅ UPDATE ADD-ON PRICES
                const addonPrices = card.querySelectorAll(".addon-price");
                const personPrice = pkg.addPersonPrice || 150;
                const hourPrice = pkg.addHourPrice || 500;
                
                if (addonPrices[0]) {
                    addonPrices[0].textContent = `₱${Number(personPrice).toLocaleString()}`;
                }
                if (addonPrices[1]) {
                    addonPrices[1].textContent = `₱${Number(hourPrice).toLocaleString()}`;
                }
                
                console.log(`✅ Updated main page card ${index + 1}:`, {
                    package: pkg.packageType,
                    price: pkg.price,
                    personPrice: personPrice,
                    hourPrice: hourPrice
                });
            }
        });
        
        console.log("✅ Main page package cards updated");
    }

    async function loadPackages() {
        console.log("📦 Loading packages...");
        const packages = await fetchPackages();
        currentPackages = packages;
        
        if (packages.length > 0) {
            renderPackageCards(packages);
            // ✅ ADD THIS LINE TO UPDATE MAIN PAGE CARDS
            updateMainPackageCards(packages);
            console.log(`✅ ${packages.length} packages loaded`);
            
            // ✅ UPDATE CURRENT PACKAGE PRICES IF MODAL IS OPEN
            if (isModalOpen && packageTypeEl && packageTypeEl.textContent) {
                const currentPackage = packages.find(pkg => 
                    pkg.packageType === packageTypeEl.textContent + ' Package'
                );
                
                if (currentPackage && bookingModal) {
                    const personPrice = currentPackage.addPersonPrice || 150;
                    const hourPrice = currentPackage.addHourPrice || 500;
                    
                    bookingModal.dataset.personPrice = personPrice;
                    bookingModal.dataset.hourPrice = hourPrice;
                    updateAddOnPricesDisplay(personPrice, hourPrice);
                    computeTotal(); // Recalculate with new prices
                    
                    console.log("🔄 Updated current package prices:", { personPrice, hourPrice });
                }
            }
        } else {
            console.log("❌ No packages found");
        }
    }

    // ===== UTILITY FUNCTIONS =====
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
        if (!checkinDateStr || !checkoutDateEl) return;
        checkoutDateEl.value = duration === "same-day" ? checkinDateStr : addDays(checkinDateStr, 1);
    }

    // ✅ UPDATED COMPUTE TOTAL FUNCTION WITH DYNAMIC PRICING
    function computeTotal() {
        if (!basePriceEl || !totalPriceEl) return;
        
        const base = Number(bookingModal?.dataset.currentBase || parsePriceString(basePriceEl.value));
        const addPax = Number(additionalPaxEl?.value) || 0;
        const addHrs = Number(additionalHoursEl?.value) || 0;
        
        // ✅ USE DYNAMIC PRICES FROM DATASET OR FALLBACK TO DEFAULT
        const personPrice = Number(bookingModal?.dataset.personPrice) || 150;
        const hourPrice = Number(bookingModal?.dataset.hourPrice) || 500;
        
        const total = base + addPax * personPrice + addHrs * hourPrice;
        totalPriceEl.value = formatPHP(total);
        basePriceEl.value = formatPHP(base);
        
        console.log("💰 Total computed:", {
            base,
            addPax,
            addHrs,
            personPrice,
            hourPrice,
            total
        });
    }

    // ===== EVENT LISTENERS =====
    function setupEventListeners() {
        console.log("🔗 Setting up event listeners...");
        
        // Modal close on background click
        if (modal) {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) closeModal();
            });
        }

        // ✅ DATE VALIDATION INITIALIZATION
        initializeDateValidation();

        // Cancel booking button
        if (cancelBooking) {
            cancelBooking.addEventListener("click", (e) => {
                e.preventDefault();
                if (formSection) formSection.style.display = "none";
                if (packageSection) packageSection.style.display = "block";
                if (bookingModal) bookingModal.classList.remove("step2");
                if (oneDayOptionRow) oneDayOptionRow.style.display = "none";
            });
        }

        // Form inputs
        if (oneDayOptionSelect) {
            oneDayOptionSelect.addEventListener("change", () => {
                const selectedText = oneDayOptionSelect.options[oneDayOptionSelect.selectedIndex].text;
                const parts = selectedText.split(" - ");
                if (checkinTimeEl) checkinTimeEl.value = parts[0] ? parts[0].trim() : "";
                if (checkoutTimeEl) checkoutTimeEl.value = parts[1] ? parts[1].trim() : "";
                if (bookingModal) bookingModal.dataset.currentDuration = "next-day";
                if (checkinDateEl && checkinDateEl.value) {
                    setCheckoutDateFrom(checkinDateEl.value, bookingModal.dataset.currentDuration);
                }
            });
        }

        if (checkinDateEl) {
            checkinDateEl.addEventListener("change", (e) => {
                const duration = bookingModal?.dataset.currentDuration || "same-day";
                setCheckoutDateFrom(e.target.value, duration);
            });
        }

        // ✅ UPDATE EVENT LISTENERS FOR ADDITIONAL INPUTS
        if (additionalPaxEl) {
            additionalPaxEl.addEventListener("input", () => computeTotal());
        }
        if (additionalHoursEl) {
            additionalHoursEl.addEventListener("input", () => computeTotal());
        }

        // Form submission
        if (bookingForm) {
            bookingForm.addEventListener("submit", handleFormSubmit);
        }

        console.log("✅ Event listeners setup completed");
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        console.log("📝 Form submission started");

        // ✅ DATE VALIDATION CHECK
        if (!validateDates()) {
            return; // Stop submission if dates are invalid
        }

        const guestID = localStorage.getItem("guestID");
        if (!guestID) {
            alert("⚠️ Please log in first.");
            return;
        }

        // ✅ GET CURRENT PRICES FOR ACCURATE DATA SUBMISSION
        const personPrice = Number(bookingModal?.dataset.personPrice) || 150;
        const hourPrice = Number(bookingModal?.dataset.hourPrice) || 500;

        const bookingData = {
            guestID,
            packageID: bookingModal?.dataset.packageId || null,
            packageType: packageTypeEl ? packageTypeEl.textContent.trim() : "",
            // packageTypeEl: packageTypeEl ? packageTypeEl.textContent : "",
            checkinDate: checkinDateEl ? checkinDateEl.value : "",
            checkoutDate: checkoutDateEl ? checkoutDateEl.value : "",
            checkinTime: checkinTimeEl ? checkinTimeEl.value : "",
            checkoutTime: checkoutTimeEl ? checkoutTimeEl.value : "",
            numGuests: Number(numGuestsEl ? numGuestsEl.value : 0),
            additionalPax: Number(additionalPaxEl ? additionalPaxEl.value : 0),
            additionalHours: Number(additionalHoursEl ? additionalHoursEl.value : 0),
            basePrice: Number(bookingModal?.dataset.currentBase || 0),
            totalPrice: parseFloat(totalPriceEl ? totalPriceEl.value.replace(/[^0-9.]/g, "") : 0),
            // ✅ INCLUDE ACTUAL PRICES USED IN CALCULATION
            personPrice: personPrice,
            hourPrice: hourPrice
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
                if (bookingForm) bookingForm.reset();
            } else {
                alert("❌ " + result.message);
            }
        } catch (err) {
            console.error("Booking submit error:", err);
            alert("⚠️ Something went wrong while saving your booking.");
        }
    }

    // ===== INITIALIZATION =====
    function initialize() {
        console.log("🚀 Starting booking system initialization...");
        initializeBookNowButtons();
        setupEventListeners();
        loadPackages();
        console.log("✅ Booking system fully initialized");
    }

    // Start everything
    initialize();

    // Auto-refresh packages every 30 seconds to get updates from admin
    setInterval(() => {
        loadPackages();
    }, 30000);

    // Reinitialize buttons every 3 seconds (safety net)
    setInterval(() => {
        initializeBookNowButtons();
    }, 3000);
});