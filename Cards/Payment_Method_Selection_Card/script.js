document.getElementById("proceedBtn").addEventListener("click", function() {
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
  const refNo = document.getElementById("refNo").value.trim();
  const amountPaid = document.getElementById("amountPaid").value.trim();

  if (!paymentMethod) {
    alert("Please select a payment method.");
    return;
  }

  if (refNo === "" || amountPaid === "") {
    alert("Please fill out all payment details before proceeding.");
    return;
  }

  const popup = document.getElementById("popup");
  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
    window.location.href = "book-confirmation.html"; // for next step later
  }, 2500);
});
