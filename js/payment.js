// ===== SIMPLIFIED PAYMENT SYSTEM - FIRST PAYMENT ONLY =====
document.addEventListener("DOMContentLoaded", function () {
  initializePaymentSystem();
});

function initializePaymentSystem() {
  setupPaymentMethods();
  setupPaymentAmount();
  setupPaymentConfirmation();
  setupModalControls();
}

// ===== PAYMENT METHOD BUTTONS HANDLER =====
function setupPaymentMethods() {
  const buttons = document.querySelectorAll(".payment-btn");
  const gcashDetails = document.querySelector(".gcash-details");
  const bankDetails = document.querySelector(".bank-details");
  const placeholder = document.querySelector(".placeholder");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active from all buttons
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Hide all details
      if (gcashDetails) {
        gcashDetails.classList.add("hidden");
        gcashDetails.classList.remove("show");
      }
      if (bankDetails) {
        bankDetails.classList.add("hidden");
        bankDetails.classList.remove("show");
      }
      if (placeholder) {
        placeholder.classList.remove("active");
      }

      // Show selected method
      const method = btn.getAttribute("data-method");
      if (method === "GCash" && gcashDetails) {
        gcashDetails.classList.remove("hidden");
        setTimeout(() => gcashDetails.classList.add("show"), 50);
        updateAmountDisplays();
      } else if (method === "Bank Transfer" && bankDetails) {
        bankDetails.classList.remove("hidden");
        setTimeout(() => bankDetails.classList.add("show"), 50);
        updateAmountDisplays();
      }
    });
  });
}

// ===== PAYMENT AMOUNT HANDLER =====
function setupPaymentAmount() {
  const paymentAmount = document.getElementById("paymentAmount");

  if (!paymentAmount) return;

  paymentAmount.addEventListener("input", function () {
    updateAmountDisplays();

    // Validate minimum amount
    const amount = parseFloat(this.value) || 0;
    if (amount > 0 && amount < 1000) {
      this.style.borderColor = "#ff4444";
    } else {
      this.style.borderColor = "";
    }
  });

  // Initial update
  updateAmountDisplays();
}

// ===== UPDATE ALL AMOUNT DISPLAYS =====
function updateAmountDisplays() {
  const paymentAmount = document.getElementById("paymentAmount");
  const gcashAmount = document.getElementById("gcash-amount");
  const bankAmount = document.getElementById("bank-amount");
  const firstPaymentAmount = document.getElementById("first-payment-amount");

  if (!paymentAmount) return;

  const amount = parseFloat(paymentAmount.value) || 0;
  const formattedAmount = `₱${amount.toLocaleString()}`;

  if (gcashAmount) gcashAmount.textContent = formattedAmount;
  if (bankAmount) bankAmount.value = formattedAmount;
  if (firstPaymentAmount) firstPaymentAmount.textContent = formattedAmount;
}

// ===== PAYMENT CONFIRMATION =====
function setupPaymentConfirmation() {
  const confirmBtn = document.getElementById("confirmPayment");
  const popup = document.getElementById("popup");

  if (!confirmBtn) return;

  confirmBtn.addEventListener("click", async function () {
    const activeBtn = document.querySelector(".payment-btn.active");
    const amount = parseFloat(document.getElementById("paymentAmount").value);

    // Get guest ID from multiple sources
    const guestID = document.getElementById("paymentGuestID").value || localStorage.getItem("guestID");
    const bookingID = document.getElementById("paymentBookingID").value;

    console.log("🔍 PAYMENT DEBUG - GuestID:", guestID, "BookingID:", bookingID, "Amount:", amount);

    // Validation
    if (!activeBtn) {
      alert("Please select a payment method.");
      return;
    }

    if (!amount || amount < 1000) {
      alert("First payment must be at least ₱1,000");
      return;
    }

    if (!guestID) {
      alert("Please log in to make payment");
      return;
    }

    // Additional validation for Bank Transfer
    const method = activeBtn.getAttribute("data-method");
    if (method === "Bank Transfer") {
      const bankName = document.getElementById("bankName").value;
      const referenceNumber = document.getElementById("referenceNumber").value;

      if (!bankName) {
        alert("Please select your bank");
        return;
      }
      if (!referenceNumber) {
        alert("Please enter transaction reference number");
        return;
      }
    }

    // Show processing popup
    if (popup) {
      popup.style.display = "block";
      popup.textContent = "Processing your payment...";
    }

    try {
      const paymentData = {
        guestID: guestID,
        bookingID: bookingID || null, // ✅ FIX: Always send bookingID even if empty
        amount: amount,
        paymentMethod: method,
        remarks: `First Payment - ${method} - Complete at resort`,
      };

      console.log("📤 SENDING PAYMENT DATA:", paymentData);

      const response = await fetch("/api/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      console.log("📥 PAYMENT RESPONSE STATUS:", response.status);

      const result = await response.json();
      console.log("📥 PAYMENT RESPONSE DATA:", result);

      if (response.ok) {
        console.log("✅ PAYMENT SUCCESS - Transaction ID:", result.transactionID);
        showPaymentSuccess(popup);
      } else {
        console.error("❌ PAYMENT FAILED:", result.message);
        showPaymentError(popup, result.message);
      }
    } catch (error) {
      console.error("❌ PAYMENT NETWORK ERROR:", error);
      showPaymentError(popup, "Payment failed. Please try again.");
    }
  });
}

// ===== PAYMENT SUCCESS HANDLER =====
function showPaymentSuccess(popup) {
  if (popup) {
    popup.textContent = "✅ First payment successful! Complete payment at resort.";
    popup.style.backgroundColor = "#4CAF50";
  }

  setTimeout(() => {
    closePaymentModal();
    resetPaymentForm();

    if (popup) {
      popup.style.display = "none";
      popup.textContent = "Processing your payment...";
      popup.style.backgroundColor = "";
    }

    alert("✅ First payment successful! Please complete payment at resort.");
  }, 2000);
}

// ===== PAYMENT ERROR HANDLER =====
function showPaymentError(popup, message) {
  if (popup) {
    popup.textContent = `❌ ${message}`;
    popup.style.backgroundColor = "#ff4444";
  }

  setTimeout(() => {
    if (popup) {
      popup.style.display = "none";
      popup.textContent = "Processing your payment...";
      popup.style.backgroundColor = "";
    }
  }, 3000);
}

// ===== MODAL CONTROLS =====
function setupModalControls() {
  // Close when clicking outside
  const modal = document.getElementById("payment-modal");
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        closePaymentModal();
      }
    });
  }
}

// ===== OPEN PAYMENT MODAL =====
function openPaymentModal(bookingData) {
  if (!bookingData) {
    console.error("❌ No booking data provided");
    return;
  }

  console.log("🔄 OPENING PAYMENT MODAL with booking data:", bookingData);

  // Ensure modal is properly closed first
  const paymentModal = document.getElementById("payment-modal");
  if (paymentModal) {
    paymentModal.style.display = "none";
  }

  // Update booking summary with detailed info
  updateBookingSummary(bookingData);

  // Set payment amount to minimum 1000
  const paymentAmount = document.getElementById("paymentAmount");
  if (paymentAmount) {
    paymentAmount.value = "1000";
    paymentAmount.min = "1000";
  }

  // Set guest and booking IDs
  const guestID = document.getElementById("paymentGuestID");
  const bookingID = document.getElementById("paymentBookingID");
  const currentGuestID = localStorage.getItem("guestID") || bookingData.guestID;

  if (guestID) {
    guestID.value = currentGuestID;
    console.log("✅ Set paymentGuestID to:", currentGuestID);
  }
  if (bookingID) {
    bookingID.value = bookingData.bookingID || "NO_BOOKING_ID"; // ✅ FIX: Always set bookingID
    console.log("✅ Set paymentBookingID to:", bookingData.bookingID);
  }

  // Reset form state
  resetPaymentForm();

  // Update amount displays
  updateAmountDisplays();

  // Show modal with slight delay to ensure DOM is ready
  setTimeout(() => {
    showPaymentModal();
  }, 100);
}

// ===== UPDATE BOOKING SUMMARY =====
function updateBookingSummary(bookingData) {
  const idElement = document.getElementById("booking-summary-id");
  const packageElement = document.getElementById("booking-summary-package");
  const checkinElement = document.getElementById("booking-summary-checkin");
  const checkoutElement = document.getElementById("booking-summary-checkout");
  const guestsElement = document.getElementById("booking-summary-guests");
  const baseElement = document.getElementById("booking-summary-base");
  const addpaxElement = document.getElementById("booking-summary-addpax");
  const totalElement = document.getElementById("booking-summary-total");

  if (idElement) idElement.textContent = bookingData.bookingID || "N/A";
  if (packageElement) packageElement.textContent = bookingData.packageName || "N/A";
  if (checkinElement) checkinElement.textContent = formatDateTime(bookingData.checkinDate, bookingData.checkinTime);
  if (checkoutElement) checkoutElement.textContent = formatDateTime(bookingData.checkoutDate, bookingData.checkoutTime);
  if (guestsElement) guestsElement.textContent = formatGuests(bookingData.numGuests, bookingData.additionalPax);
  if (baseElement) baseElement.textContent = `₱${(bookingData.basePrice || 0).toLocaleString()}`;
  if (addpaxElement) addpaxElement.textContent = `₱${((bookingData.additionalPax || 0) * 150).toLocaleString()}`;
  if (totalElement) totalElement.textContent = `₱${(bookingData.totalPrice || 0).toLocaleString()}`;
}

// ===== FORMAT DATE TIME =====
function formatDateTime(dateString, timeString) {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return timeString ? `${formattedDate} ${timeString}` : formattedDate;
  } catch (error) {
    return dateString;
  }
}

// ===== FORMAT GUESTS =====
function formatGuests(numGuests, additionalPax) {
  let result = `${numGuests || 0}`;
  if (additionalPax && additionalPax > 0) {
    result += ` + ${additionalPax} additional`;
  }
  return result;
}

// ===== SHOW PAYMENT MODAL =====
function showPaymentModal() {
  const paymentModal = document.getElementById("payment-modal");
  if (paymentModal) {
    paymentModal.style.display = "flex";
    paymentModal.style.opacity = "1";
    paymentModal.style.visibility = "visible";

    const modalContent = paymentModal.querySelector(".modal-content");
    if (modalContent) {
      modalContent.classList.remove("animate-in");
      void modalContent.offsetWidth;
      modalContent.classList.add("animate-in");
    }

    console.log("✅ Payment modal shown successfully");
  }
}

// ===== CLOSE PAYMENT MODAL =====
function closePaymentModal() {
  const paymentModal = document.getElementById("payment-modal");
  if (!paymentModal) return;

  const modalContent = paymentModal.querySelector(".modal-content");
  if (modalContent) {
    modalContent.classList.remove("animate-in");
  }

  setTimeout(() => {
    paymentModal.style.display = "none";
    paymentModal.style.opacity = "0";
    paymentModal.style.visibility = "hidden";
    resetPaymentForm();
  }, 300);
}

// ===== RESET PAYMENT FORM =====
function resetPaymentForm() {
  // Reset amount
  const paymentAmount = document.getElementById("paymentAmount");
  if (paymentAmount) {
    paymentAmount.value = "";
    paymentAmount.style.borderColor = "";
  }

  // Reset payment method buttons
  const buttons = document.querySelectorAll(".payment-btn");
  buttons.forEach((btn) => btn.classList.remove("active"));

  // Reset bank fields
  const bankName = document.getElementById("bankName");
  const accountNumber = document.getElementById("accountNumber");
  const referenceNumber = document.getElementById("referenceNumber");

  if (bankName) bankName.value = "";
  if (accountNumber) accountNumber.value = "";
  if (referenceNumber) referenceNumber.value = "";

  // Hide all payment details sections
  const placeholder = document.querySelector(".placeholder");
  const gcashDetails = document.querySelector(".gcash-details");
  const bankDetails = document.querySelector(".bank-details");

  if (placeholder) placeholder.classList.add("active");
  if (gcashDetails) gcashDetails.classList.add("hidden");
  if (bankDetails) bankDetails.classList.add("hidden");

  // Reset amount displays
  updateAmountDisplays();
}

// ===== MAKE FUNCTIONS AVAILABLE GLOBALLY =====
window.openPaymentModal = openPaymentModal;
window.closePaymentModal = closePaymentModal;
window.initializePaymentSystem = initializePaymentSystem;