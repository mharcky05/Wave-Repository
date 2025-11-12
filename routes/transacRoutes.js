// routes/transacRoutes.js 
const express = require("express");
const router = express.Router();
const db = require("../db");

// 🟢 ADD THIS NEW ROUTE - CHECK IF PAYMENT ALREADY EXISTS
router.get("/check/:bookingID", (req, res) => {
  const { bookingID } = req.params;

  console.log(`🔍 Checking payment status for booking: ${bookingID}`);

  // SQL query para hanapin kung may completed payment na
  const sql = `
    SELECT * FROM tbl_transactions 
    WHERE bookingID = ? AND status = 'Completed'
    LIMIT 1
  `;

  db.query(sql, [bookingID], (err, results) => {
    if (err) {
      console.error("❌ Error checking payment:", err);
      return res.status(500).json({ 
        success: false,
        message: "Database error" 
      });
    }

    // I-return kung may existing payment na o wala
    const response = {
      success: true,
      alreadyPaid: results.length > 0,  // true kung may payment na
      payment: results[0] || null       // details ng payment kung meron
    };

    console.log(`📊 Payment check result for ${bookingID}:`, response.alreadyPaid);
    res.json(response);
  });
});

// 🟢 UPDATE EXISTING PROCESS PAYMENT ROUTE - ENSURE BOOKING STATUS UPDATE
router.post("/process", (req, res) => {
  console.log("🚨 PAYMENT ATTEMPT - RAW BODY:", req.body);

  // ✅ FIRST CHECK IF PAYMENT ALREADY EXISTS - ITO ANG BAGONG VALIDATION
  const checkSql = `
    SELECT transactionID FROM tbl_transactions 
    WHERE bookingID = ? AND status = 'Completed'
    LIMIT 1
  `;

  // GET LATEST APPROVED BOOKING FOR THIS GUEST
  const getLatestBookingSQL = `
    SELECT bookingID, packageID, checkinDate, totalPrice, status
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

    // ✅ KUNG WALANG BOOKING, HUWAG MAG-PROCESS
    if (bookingResults.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No approved booking found for payment"
      });
    }

    const bookingID = bookingResults[0].bookingID;
    const currentBookingStatus = bookingResults[0].status;

    // ✅ CHECK IF BOOKING IS ALREADY COMPLETED
    if (currentBookingStatus === "Completed") {
      console.log(`⛔ Payment blocked - Booking already completed: ${bookingID}`);
      return res.status(400).json({
        success: false,
        message: "Booking is already completed. Payment not allowed."
      });
    }

    // ✅ CHECK IF ALREADY PAID - BAGONG VALIDATION
    db.query(checkSql, [bookingID], (checkErr, checkResults) => {
      if (checkErr) {
        console.error("❌ Error checking existing payment:", checkErr);
        return res.status(500).json({ 
          success: false,
          message: "Payment validation error" 
        });
      }

      // ✅ KUNG MAY EXISTING PAYMENT NA, HUWAG NA MAG-PROCESS
      if (checkResults.length > 0) {
        console.log(`⛔ Payment blocked - Already paid for booking: ${bookingID}`);
        return res.status(400).json({
          success: false,
          message: "Payment already completed for this booking!"
        });
      }

      // ✅ PROCEED WITH PAYMENT IF NO EXISTING PAYMENT
      console.log(`✅ No existing payment found - Proceeding with payment for booking: ${bookingID}`);

      let packageID = "N/A";
      let checkinDate = "N/A";
      let bookingTotal = 0;

      if (bookingResults.length > 0) {
        packageID = bookingResults[0].packageID;
        checkinDate = bookingResults[0].checkinDate;
        bookingTotal = Number(bookingResults[0].totalPrice) || 0;
      }

      const transactionID = "TXN" + Date.now();
      const amountPaid = Number(req.body.amount) || 0;

      // ✅ DETERMINE STATUS AND REMARKS
      let status, remarks;

      if (amountPaid === bookingTotal) {
        status = "Completed";
        remarks = "Full payment received";
        
        // ✅ CRITICAL: UPDATE BOOKING STATUS TO COMPLETED FOR FULL PAYMENT
        if (bookingID) {
          const updateBookingSQL = `UPDATE tbl_bookings SET status = 'Completed' WHERE bookingID = ?`;
          db.query(updateBookingSQL, [bookingID], (updateErr, updateResult) => {
            if (updateErr) {
              console.error("❌ Booking status update error:", updateErr);
            } else {
              console.log(`✅ CRITICAL: Booking ${bookingID} status updated to Completed`);
            }
          });
        }
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

      db.query(sql, values, (insertErr, result) => {
        if (insertErr) {
          console.error("❌ DB ERROR:", insertErr);
          return res.status(500).json({
            success: false,
            message: "Database error: " + insertErr.message
          });
        }

        console.log(`✅ Payment inserted for ${req.body.guestID}, Status: ${status}`);

        // ✅ SEND FEEDBACK NOTIFICATION FOR FULL PAYMENT ONLY
        if (status === "Completed" && bookingID) {
          const feedbackMessage = "Your booking is now complete! Please share your experience at L'Escapade by leaving a feedback.";

          const feedbackNotifSQL = `
            INSERT INTO tbl_notifications (guestID, message, isRead, createdAt)
            VALUES (?, ?, 0, NOW())
          `;

          db.query(feedbackNotifSQL, [req.body.guestID, feedbackMessage], (notifErr) => {
            if (notifErr) {
              console.error("❌ Failed to send feedback notification:", notifErr);
            } else {
              console.log(`🎉 Feedback notification auto-sent to guest ${req.body.guestID} for FULL PAYMENT`);
            }
          });
        }

        res.json({
          success: true,
          message: `Payment successful! Transaction ${status.toLowerCase()}.`,
          transactionID: transactionID,
          status: status,
          bookingStatus: status === "Completed" ? "Completed" : "Approved" // ✅ RETURN BOOKING STATUS
        });
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
      b.packageID,
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

// ✅ FIXED: PUT /api/payments/transactions/:transactionID/status - Update transaction status
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

    // ✅ SEND FEEDBACK NOTIFICATION WHEN ADMIN MARKS AS COMPLETED
    if (status === "Completed") {
      console.log(`🎯 Transaction ${transactionID} completed — inserting feedback notification...`);

      const getGuestSQL = `SELECT guestID, bookingID FROM tbl_transactions WHERE transactionID = ?`;
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
        const bookingID = guestRes[0].bookingID;
        
        // ✅ UPDATE BOOKING STATUS TO COMPLETED
        if (bookingID) {
          const updateBookingSQL = `UPDATE tbl_bookings SET status = 'Completed' WHERE bookingID = ?`;
          db.query(updateBookingSQL, [bookingID], (updateErr) => {
            if (updateErr) {
              console.error("❌ Booking status update error:", updateErr);
            } else {
              console.log(`✅ Booking ${bookingID} status updated to Completed`);
            }
          });
        }

        const feedbackMessage = "Your booking is now complete! Please share your experience at L'Escapade by leaving a feedback.";

        const insertNotifSQL = `
          INSERT INTO tbl_notifications (guestID, message, isRead, createdAt)
          VALUES (?, ?, 0, NOW())
        `;

        db.query(insertNotifSQL, [guestID, feedbackMessage], (err3, notifResult) => {
          if (err3) {
            console.error("❌ Notification insert error:", err3);
          } else {
            console.log(`✅ Feedback notification created for guest ${guestID} (Transaction: ${transactionID})`);
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

// 🟢 ADD TO transacRoutes.js - GET ALL BOOKINGS FOR GUEST
router.get("/bookings/guest/:guestID", (req, res) => {
    const { guestID } = req.params;

    const sql = `
        SELECT bookingID, status, packageID, totalPrice
        FROM tbl_bookings 
        WHERE guestID = ?
        ORDER BY createdAt DESC
    `;

    db.query(sql, [guestID], (err, results) => {
        if (err) {
            console.error("❌ Error fetching guest bookings:", err);
            return res.status(500).json({ 
                success: false,
                message: "Database error" 
            });
        }

        res.json(results);
    });
});

// 🟢 ADD TO transacRoutes.js - GET ALL BOOKINGS FOR GUEST
router.get("/bookings/guest/:guestID", (req, res) => {
    const { guestID } = req.params;

    const sql = `
        SELECT bookingID, status, packageID, totalPrice
        FROM tbl_bookings 
        WHERE guestID = ?
        ORDER BY createdAt DESC
    `;

    db.query(sql, [guestID], (err, results) => {
        if (err) {
            console.error("❌ Error fetching guest bookings:", err);
            return res.status(500).json({ 
                success: false,
                message: "Database error" 
            });
        }

        res.json(results);
    });
});

module.exports = router;