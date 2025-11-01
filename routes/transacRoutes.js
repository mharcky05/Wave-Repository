// routes/transacRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// POST /api/payments/process
router.post("/process", (req, res) => {
  const {
    guestID,
    bookingID,
    paymentType,
    amount,
    paymentMethod,
    transactionType = "payment",
    remarks = ""
  } = req.body;

  console.log("Payment received:", { guestID, paymentType, amount, paymentMethod });

  // Validation
  if (!guestID || !paymentType || !amount || !paymentMethod) {
    return res.status(400).json({ message: "Required fields missing." });
  }

  if (paymentType === "partial" && amount < 1000) {
    return res.status(400).json({ message: "Partial payment must be at least ₱1,000." });
  }

  // Generate transaction ID
  const transactionID = "TXN" + Date.now();

  const sql = `
    INSERT INTO tbl_transactions 
    (transactionID, guestID, bookingID, paymentType, amount, paymentMethod, transactionType, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      transactionID,
      guestID,
      bookingID || null,
      paymentType,
      amount,
      paymentMethod,
      transactionType,
      remarks
    ],
    (err, result) => {
      if (err) {
        console.error("❌ Payment processing error:", err);
        return res.status(500).json({ message: "Database error: " + err.message });
      }

      console.log("✅ Payment saved to database:", transactionID);
      
      res.json({
        message: "Payment processed successfully!",
        transactionID,
        amount,
        paymentType,
      });
    }
  );
});

// GET /api/payments/transactions - for admin to view all transactions
router.get("/transactions", (req, res) => {
  const sql = `
    SELECT 
      t.transactionID,
      t.guestID,
      t.bookingID,
      t.paymentType,
      t.amount,
      t.paymentMethod,
      t.transactionType,
      t.transactionDate,
      t.status,
      t.remarks,
      g.firstName,
      g.lastName,
      g.email,
      b.packageName,
      b.checkinDate,
      b.checkoutDate
    FROM tbl_transactions t
    LEFT JOIN tbl_guests g ON t.guestID = g.guestID
    LEFT JOIN tbl_bookings b ON t.bookingID = b.bookingID
    ORDER BY t.transactionDate DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Fetch transactions error:", err);
      return res.status(500).json({ message: "Database error: " + err.message });
    }

    res.json(results);
  });
});

module.exports = router;