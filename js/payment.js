// ===== PAYMENT METHOD SELECTION SYSTEM =====
const buttons = document.querySelectorAll(".payment-btn");
const gcashDetails = document.querySelector(".gcash-details");
const bankDetails = document.querySelector(".bank-details");
const placeholder = document.querySelector(".placeholder");

// ===== PAYMENT METHOD BUTTON HANDLERS =====
buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    // RESET ALL ACTIVE STATES
    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    gcashDetails.classList.add("hidden");
    bankDetails.classList.add("hidden");
    placeholder.classList.remove("active");
    gcashDetails.classList.remove("show");
    bankDetails.classList.remove("show");

    // SHOW SELECTED PAYMENT METHOD DETAILS
    const method = btn.getAttribute("data-method");
    if (method === "gcash") {
      gcashDetails.classList.remove("hidden");
      setTimeout(() => gcashDetails.classList.add("show"), 50);
    } else if (method === "bank") {
      bankDetails.classList.remove("hidden");
      setTimeout(() => bankDetails.classList.add("show"), 50);
    }
  });
});

// ===== PAYMENT CONFIRMATION HANDLER =====
const confirmBtn = document.getElementById("confirmPayment");
const popup = document.getElementById("popup");

confirmBtn.addEventListener("click", () => {
  const activeBtn = document.querySelector(".payment-btn.active");
  if (!activeBtn) {
    alert("Please select a payment method.");
    return;
  }

  // VALIDATE BANK TRANSACTION DETAILS
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

  // SHOW SUCCESS POPUP AND REDIRECT
  popup.classList.add("show");
  setTimeout(() => {
    popup.classList.remove("show");
    window.location.href = "book-confirmation.html";
  }, 2500);
});
