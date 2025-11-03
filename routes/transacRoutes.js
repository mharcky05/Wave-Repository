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
    let bookingTotal = 0;

    if (bookingResults.length > 0) {
      bookingID = bookingResults[0].bookingID;
      packageName = bookingResults[0].packageName;
      checkinDate = bookingResults[0].checkinDate;
      bookingTotal = Number(bookingResults[0].totalPrice) || 0;
    }

    const transactionID = "TXN" + Date.now();
    const amountPaid = Number(req.body.amount) || 0;

    // ✅ GET BOOKING TOTAL FROM DATABASE
    const bookingTotalNum = bookingResults.length > 0 ? Number(bookingResults[0].totalPrice) : 0;

    // ✅ DETERMINE STATUS AND REMARKS
    let status, remarks;

    if (amountPaid === bookingTotalNum) {
      status = "Completed";
      remarks = "Full payment received";
    } else {
      status = "Pending Completion";
      remarks = `Partial payment - ${req.body.paymentMethod}`;
    }
    const sql = `
  INSERT INTO tbl_transactions 
  (transactionID, guestID, bookingID, paymentType, amount, paymentMethod, status, remarks)
  VALUES (?, ?, ?, 'partial', ?, ?, ?, ?)
`;

    const values = [
      transactionID,
      req.body.guestID || 'G163540',
      bookingID,
      amountPaid,
      req.body.paymentMethod || 'GCash',
      status,
      remarks
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("❌ DB ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Database error: " + err.message
        });
      }

      console.log(`✅ Payment inserted for ${req.body.guestID}, Status: ${status}`);

      // 🟢 If payment is fully completed, auto-generate feedback request
      if (status === "Completed" && bookingID) {
        const feedbackMessage = "Please share your experience at L'Escapade!";

        const feedbackNotifSQL = `
      INSERT INTO tbl_notifications (guestID, message, isRead, createdAt)
      VALUES (?, ?, 0, NOW())
    `;

        db.query(feedbackNotifSQL, [req.body.guestID, feedbackMessage], (notifErr) => {
          if (notifErr) {
            console.error("❌ Failed to send feedback notification:", notifErr);
          } else {
            console.log(`🎉 Feedback notification auto-sent to guest ${req.body.guestID}`);
          }
        });
      }

      res.json({
        success: true,
        message: `Payment successful! Transaction ${status.toLowerCase()}.`,
        transactionID: transactionID,
        status: status
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

// ✅ UPDATED: PUT /api/payments/transactions/:transactionID/status - Update transaction status + auto feedback notif
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
      console.warn(`⚠️ Transaction not found for ID: ${transactionID}`);
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }

    console.log(`✅ Transaction ${transactionID} status updated to: ${status}`);

    // 🎯 Trigger feedback notification automatically when marked Completed
    if (status === "Completed") {
      console.log(`🎯 Transaction ${transactionID} completed — inserting feedback notification...`);

      const getGuestSQL = `SELECT guestID FROM tbl_transactions WHERE transactionID = ?`;
      db.query(getGuestSQL, [transactionID], (err2, guestRes) => {
        if (err2) {
          console.error("❌ Error fetching guest:", err2);
          return;
        }

        if (guestRes.length === 0) {
          console.warn(`⚠️ No guest found for transaction ${transactionID}`);
          return;
        }

        const guestID = guestRes[0].guestID;
        const feedbackMessage = "Please provide feedback for your recent stay at L'Escapade.";

        const insertNotifSQL = `
          INSERT INTO tbl_notifications (guestID, message, isRead, createdAt)
          VALUES (?, ?, 0, NOW())
        `;

        db.query(insertNotifSQL, [guestID, feedbackMessage], (err3, notifResult) => {
          if (err3) {
            console.error("❌ Notification insert error:", err3);
          } else {
            console.log(`✅ Feedback notification created for guest ${guestID} (notifID: ${notifResult.insertId})`);
          }
        });
      });
    }

    res.json({
      success: true,
      message: `Transaction status updated to ${status}`,
      transactionID,
      status
    });
  });
});

module.exports = router;