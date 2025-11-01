  // Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
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

    // Set default to Full Payment
    fullRadio.checked = true;
    amountField.value = "0";
    amountField.readOnly = true;

    // Event listeners
    partialRadio.addEventListener('change', function() {
        if (this.checked) {
            amountField.value = "1000";
            amountField.readOnly = false;
            amountField.min = "1000";
            updateBankAmount();
        }
    });

    fullRadio.addEventListener('change', function() {
        if (this.checked) {
            // Get amount from booking summary
            const totalElement = document.getElementById('booking-summary-total');
            if (totalElement) {
                const totalText = totalElement.textContent;
                // Extract number from "₱6,100" format
                const total = totalText.replace('₱', '').replace(/,/g, '');
                amountField.value = total;
            }
            amountField.readOnly = true;
            updateBankAmount();
        }
    });

    // Update bank amount when payment amount changes
    amountField.addEventListener('input', updateBankAmount);
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
            guestID: guestID,
            paymentType: selectedPaymentType.value,
            amount: amount,
            paymentMethod: activeBtn.dataset.method === 'gcash' ? 'GCash' : 'Bank Transfer',
            transactionType: 'payment',
        };

        try {
            const response = await fetch("/api/payments/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(paymentData),
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
    const closeBtn = document.getElementById("closePayment");
    if (closeBtn) {
        closeBtn.addEventListener("click", closePaymentModal);
    }

    // Close when clicking outside
    const modal = document.getElementById("payment-modal");
    if (modal) {
        modal.addEventListener("click", function(e) {
            if (e.target === modal) {
                closePaymentModal();
            }
        });
    }
}

// Open payment modal function
function openPaymentModal(bookingData) {
    if (!bookingData) {
        console.error("No booking data provided");
        return;
    }

    console.log("Opening payment modal with:", bookingData);

    // Update booking summary
    const totalElement = document.getElementById('booking-summary-total');
    const packageElement = document.getElementById('booking-summary-package');
    const dateElement = document.getElementById('booking-summary-date');
    
    if (totalElement) {
        totalElement.textContent = `₱${bookingData.totalPrice.toLocaleString()}`;
        console.log("Updated total to:", totalElement.textContent);
    }
    if (packageElement) {
        packageElement.textContent = bookingData.packageName || 'N/A';
    }
    if (dateElement) {
        dateElement.textContent = bookingData.checkinDate || 'N/A';
    }

    // Set payment amount
    const fullRadio = document.getElementById('fullPayment');
    const amountField = document.getElementById('paymentAmount');
    
    if (fullRadio && amountField) {
        fullRadio.checked = true;
        amountField.value = bookingData.totalPrice;
        amountField.readOnly = true;
        console.log("Set amount field to:", amountField.value);
    }

    // Reset payment methods
    const buttons = document.querySelectorAll(".payment-btn");
    buttons.forEach(btn => btn.classList.remove("active"));
    
    const placeholder = document.querySelector(".placeholder");
    if (placeholder) placeholder.classList.add("active");

    // Update bank amount
    updateBankAmount();

    // Show modal
    const paymentModal = document.getElementById('payment-modal');
    if (paymentModal) {
        paymentModal.style.display = 'flex';
        console.log("Payment modal displayed");
        
        setTimeout(() => {
            const modalContent = paymentModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.classList.add('animate-in');
            }
        }, 50);
    }
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