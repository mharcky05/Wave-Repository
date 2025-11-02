// routes/transacRoutes.js - ULTIMATE FIX WITH BOOKING LINK
const express = require("express");
const router = express.Router();
const db = require("../db");

// POST /api/payments/process - ULTIMATE VERSION WITH BOOKING LINK
router.post("/process", (req, res) => {
  console.log("🚨 PAYMENT ATTEMPT - RAW BODY:", req.body);
  
  // GET LATEST APPROVED BOOKING FOR THIS GUEST
  const getLatestBookingSQL = `
    SELECT bookingID, packageName, checkinDate, totalPrice 
    FROM tbl_bookings 
    WHERE guestID = ? AND status = 'Approved' 
    ORDER BY createdAt DESC 
    LIMIT 1
  `;

  db.query(getLatestBookingSQL, [req.body.guestID || 'G163540'], (err, bookingResults) => {
    if (err) {
      console.error("❌ Booking fetch error:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Database error: " + err.message 
      });
    }

    let bookingID = null;
    let packageName = "N/A";
    let checkinDate = "N/A";
    let bookingTotal = "N/A";

    if (bookingResults.length > 0) {
      bookingID = bookingResults[0].bookingID;
      packageName = bookingResults[0].packageName;
      checkinDate = bookingResults[0].checkinDate;
      bookingTotal = bookingResults[0].totalPrice;
    }

    // CREATE TRANSACTION WITH BOOKING INFO
    const transactionID = "TXN" + Date.now();
    
    const sql = `
      INSERT INTO tbl_transactions 
      (transactionID, guestID, bookingID, paymentType, amount, paymentMethod, status, remarks)
      VALUES (?, ?, ?, 'partial', ?, ?, 'Pending Completion', ?)
    `;

    const values = [
      transactionID,
      req.body.guestID || 'G163540',
      bookingID, // ✅ NOW INCLUDES BOOKING ID
      req.body.amount || 1000,
      req.body.paymentMethod || 'GCash',
      req.body.remarks || 'First Payment'
    ];

    console.log("💾 SAVING TO DB WITH:", values);

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("❌ DB ERROR:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Database error: " + err.message 
        });
      }

      console.log("✅ PAYMENT SAVED! ID:", transactionID);
      
      res.json({
        success: true,
        message: "Payment successful!",
        transactionID: transactionID,
        bookingLinked: bookingID !== null
      });
    });
  });
});

// GET /api/payments/transactions - Get all transactions WITH BOOKING DATA
router.get("/transactions", (req, res) => {
  const sql = `
    SELECT 
      t.*, 
      g.firstName, 
      g.lastName, 
      g.contactNo,
      b.packageName,
      b.checkinDate,
      b.totalPrice as bookingTotal
    FROM tbl_transactions t
    LEFT JOIN tbl_guests g ON t.guestID = g.guestID
    LEFT JOIN tbl_bookings b ON t.bookingID = b.bookingID
    ORDER BY t.transactionDate DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Fetch error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
});

// ✅ ADDED: PUT /api/payments/transactions/:transactionID/status - Update transaction status
router.put("/transactions/:transactionID/status", (req, res) => {
  const { transactionID } = req.params;
  const { status } = req.body;

  console.log(`🔄 Updating transaction ${transactionID} status to: ${status}`);

  if (!status) {
    return res.status(400).json({ 
      success: false, 
      message: "Status is required" 
    });
  }

  const sql = `UPDATE tbl_transactions SET status = ? WHERE transactionID = ?`;
  
  db.query(sql, [status, transactionID], (err, result) => {
    if (err) {
      console.error("❌ DB Update Error:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Database error: " + err.message 
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Transaction not found" 
      });
    }

    console.log(`✅ Transaction ${transactionID} status updated to: ${status}`);
    
    res.json({
      success: true,
      message: `Transaction status updated to ${status}`,
      transactionID: transactionID,
      status: status
    });
  });
});

module.exports = router;