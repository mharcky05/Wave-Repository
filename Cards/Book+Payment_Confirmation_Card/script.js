function goBack() {
  window.location.href = "index.html";
}

document.getElementById("printBtn").addEventListener("click", async function() {
  const popup = document.getElementById("popup");
  popup.classList.add("show");

  // Simulate loading (like downloading)
  setTimeout(async () => {
    popup.classList.remove("show");

    const confirmDownload = confirm("Do you want to download your receipt as PDF?");
    if (!confirmDownload) return;

    // Generate PDF using jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("L’escapade Private Villa", 20, 20);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Booking & Payment Receipt", 20, 30);
    doc.text("------------------------------", 20, 35);

    // Reservation Details
    doc.text("Guest Name: Juan Dela Cruz", 20, 45);
    doc.text("Package: Deluxe Villa", 20, 52);
    doc.text("Check-in: October 20, 2025 (2:00 PM)", 20, 59);
    doc.text("Check-out: October 22, 2025 (12:00 NN)", 20, 66);
    doc.text("Additional Pax: 2", 20, 73);
    doc.text("Additional Hours: 1", 20, 80);

    // Payment Info
    doc.text("------------------------------", 20, 90);
    doc.text("Payment Method: GCash", 20, 98);
    doc.text("Reference No.: GC123456789", 20, 105);
    doc.text("Total Amount: ₱18,500.00", 20, 112);
    doc.text("Amount Paid: ₱18,500.00", 20, 119);
    doc.text("Balance: ₱0.00", 20, 126);

    doc.text("------------------------------", 20, 136);
    doc.setFont("helvetica", "italic");
    doc.text("Thank you for booking with L’escapade Private Villa!", 20, 145);

    // PDF download
    doc.save("Lescapade_Receipt.pdf");
  }, 2000);
});
