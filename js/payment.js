// Initialize when page loads
document.addEventListener('DOMContentLoaded', function () {
  initializePaymentSystem();
});

function initializePaymentSystem() {
  setupPaymentMethods();
  setupPaymentTypes();
  setupPaymentConfirmation();
  setupModalControls();
}

// ===== PAYMENT METHOD SELECTION =====
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
      if (method === "gcash" && gcashDetails) {
        gcashDetails.classList.remove("hidden");
        setTimeout(() => gcashDetails.classList.add("show"), 50);
      } else if (method === "bank" && bankDetails) {
        bankDetails.classList.remove("hidden");
        setTimeout(() => bankDetails.classList.add("show"), 50);
      }

      updateBankAmount();
    });
  });
}

// ===== PAYMENT TYPE SYSTEM =====
function setupPaymentTypes() {
  const partialRadio = document.getElementById('partialPayment');
  const fullRadio = document.getElementById('fullPayment');
  const amountField = document.getElementById('paymentAmount');

  if (!partialRadio || !fullRadio || !amountField) {
    console.log('Payment type elements not found');
    return;
  }

  // Default to Full Payment
  fullRadio.checked = true;
  amountField.value = "";
  amountField.readOnly = false;

  // === Partial Payment ===
  partialRadio.addEventListener('change', function () {
    if (this.checked) {
      amountField.value = "1000";
      amountField.readOnly = true; // 🔒 fixed to 1000
      amountField.min = "1000";
      updateBankAmount();
    }
  });

  // === Full Payment ===
  fullRadio.addEventListener('change', function () {
    if (this.checked) {
      amountField.value = "";
      amountField.readOnly = false; // ✏️ user can type
      amountField.focus();
      updateBankAmount();
    }
  });

  // Update bank amount when user types
  amountField.addEventListener('input', updateBankAmount);

  amountField.addEventListener('input', function () {
    // Remove invalid characters
    this.value = this.value.replace(/[^\d.]/g, '');

    // Only allow one decimal point
    const parts = this.value.split('.');
    if (parts.length > 2) {
      this.value = parts[0] + '.' + parts[1];
    }

    // Limit to two decimal places
    if (parts[1]?.length > 2) {
      this.value = parts[0] + '.' + parts[1].slice(0, 2);
    }
  });
}

function updateBankAmount() {
  const amountField = document.getElementById('paymentAmount');
  const bankAmount = document.getElementById('bank-amount');

  if (amountField && bankAmount) {
    const amount = parseInt(amountField.value) || 0;
    bankAmount.value = `₱${amount.toLocaleString()}`;
  }
}

// ===== PAYMENT CONFIRMATION =====
function setupPaymentConfirmation() {
  const confirmBtn = document.getElementById("confirmPayment");
  const popup = document.getElementById("popup");

  if (!confirmBtn) return;

  confirmBtn.addEventListener("click", async () => {
    const activeBtn = document.querySelector(".payment-btn.active");
    if (!activeBtn) {
      alert("Please select a payment method.");
      return;
    }

    // Validate payment type
    const selectedPaymentType = document.querySelector('input[name="paymentType"]:checked');
    if (!selectedPaymentType) {
      alert("Please select a payment type (Partial or Full).");
      return;
    }

    // Validate amount
    const amountField = document.getElementById("paymentAmount");
    const amount = parseInt(amountField.value);
    if (!amount || amount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    if (selectedPaymentType.value === 'partial' && amount < 1000) {
      alert("Partial payment must be at least ₱1,000.");
      return;
    }

    // Validate bank details
    if (activeBtn.dataset.method === "bank") {
      const bank = document.getElementById("bankName").value.trim();
      const remarks = document.getElementById("remarks").value.trim();
      if (bank === "") {
        alert("Please select your bank name.");
        return;
      }
      if (remarks === "") {
        alert("Please enter a purpose or remarks.");
        return;
      }
    }

    // Get guest ID
    const guestID = localStorage.getItem("guestID");
    if (!guestID) {
      alert("Please log in to proceed with payment.");
      return;
    }

    // Process payment
    const paymentData = {
      guestID,
      bookingID: transactionID,   // link to tbl_transactions
      paymentType: selectedPaymentType.value,
      amount_paid: enteredAmount,
      paymentMethod: selectedMethod,
      status: "pending"
    };

    try {
      const response = await fetch("/api/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();

      if (response.ok) {
        popup.textContent = "Payment processed successfully!";
        popup.classList.add("show");

        setTimeout(() => {
          popup.classList.remove("show");
          closePaymentModal();
          window.location.href = "book-confirmation.html";
        }, 2500);
      } else {
        alert("❌ " + result.message);
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      alert("⚠️ Something went wrong while processing your payment.");
    }
  });
}

// ===== MODAL CONTROLS =====
function setupModalControls() {
  // Close button
  if (closeBtn) {
    closeBtn.addEventListener("click", Modal);
  }

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

// Open payment modal function
function openPaymentModal(bookingData) {
  if (!bookingData) return;

  const amountField = document.getElementById('paymentAmount');
  const fullRadio = document.getElementById('fullPayment');
  const partialRadio = document.getElementById('partialPayment');

  // Update booking summary
  document.getElementById('booking-summary-total').textContent = `₱${bookingData.totalPrice.toLocaleString()}`;
  document.getElementById('booking-summary-package').textContent = bookingData.packageName || 'N/A';
  document.getElementById('booking-summary-date').textContent = bookingData.checkinDate || 'N/A';

  // Set payment type
  if (partialRadio) {
    partialRadio.checked = false;
  }
  if (fullRadio) {
    fullRadio.checked = true;
  }

  // Set amount
  if (amountField) {
    amountField.value = bookingData.totalPrice;
    amountField.readOnly = false; // ✅ allow typing for full payment
  }

  // Reset payment method buttons
  document.querySelectorAll(".payment-btn").forEach(btn => btn.classList.remove("active"));
  const placeholder = document.querySelector(".placeholder");
  if (placeholder) placeholder.classList.add("active");

  updateBankAmount();

  // Show modal
  const paymentModal = document.getElementById('payment-modal');
  if (paymentModal) paymentModal.style.display = 'flex';
  setTimeout(() => paymentModal.querySelector('.modal-content').classList.add('animate-in'), 50);
}


function closePaymentModal() {
  const paymentModal = document.getElementById("payment-modal");
  if (!paymentModal) return;

  const modalContent = paymentModal.querySelector(".modal-content");
  if (modalContent) {
    modalContent.classList.remove("animate-in");
  }

  setTimeout(() => {
    paymentModal.style.display = "none";
  }, 300);
}

// Make function available globally
window.openPaymentModal = openPaymentModal;