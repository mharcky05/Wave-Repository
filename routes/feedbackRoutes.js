// routes/feedbackRoutes.js - UPDATED VERSION
const express = require("express");
const router = express.Router();
const db = require("../db");

// 🟢 GET ALL FEEDBACKS (for admin)
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      f.feedbackID,
      f.guestID,
      f.bookingID,
      f.rating,
      f.comments,
      f.createdAt,
      CONCAT(g.firstName, ' ', g.lastName) as guestName,
      b.packageID
    FROM tbl_feedbacks f
    LEFT JOIN tbl_guests g ON f.guestID = g.guestID
    LEFT JOIN tbl_bookings b ON f.bookingID = b.bookingID
    ORDER BY f.createdAt DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching feedbacks:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
});

// 🟢 CHECK IF GUEST HAS ALREADY SUBMITTED FEEDBACK FOR LATEST BOOKING
router.get("/check-guest/:guestID", async (req, res) => {
  const { guestID } = req.params;

  console.log(`🔍 Checking if guest ${guestID} has submitted feedback for latest booking`);

  try {
    // ✅ STEP 1: GET LATEST COMPLETED BOOKING FOR THIS GUEST
    const getLatestBookingSQL = `
      SELECT bookingID FROM tbl_bookings 
      WHERE guestID = ? AND status = 'Completed'
      ORDER BY createdAt DESC 
      LIMIT 1
    `;

    db.query(getLatestBookingSQL, [guestID], (err, bookingResults) => {
      if (err) {
        console.error("❌ Error fetching latest booking:", err);
        return res.status(500).json({ 
          success: false,
          message: "Database error" 
        });
      }

      if (bookingResults.length === 0) {
        console.log(`📭 No completed bookings found for guest ${guestID}`);
        return res.json({
          success: true,
          hasSubmittedFeedback: false,
          feedbackCount: 0,
          message: "No completed bookings found"
        });
      }

      const latestBookingID = bookingResults[0].bookingID;
      console.log(`📋 Latest completed booking for ${guestID}: ${latestBookingID}`);

      // ✅ STEP 2: CHECK IF FEEDBACK ALREADY EXISTS FOR THIS BOOKING
      const checkFeedbackSQL = `
        SELECT feedbackID FROM tbl_feedbacks 
        WHERE guestID = ? AND bookingID = ?
        LIMIT 1
      `;

      db.query(checkFeedbackSQL, [guestID, latestBookingID], (err, feedbackResults) => {
        if (err) {
          console.error("❌ Error checking guest feedback:", err);
          return res.status(500).json({ 
            success: false,
            message: "Database error" 
          });
        }

        const response = {
          success: true,
          hasSubmittedFeedback: feedbackResults.length > 0,
          feedbackCount: feedbackResults.length,
          latestBookingID: latestBookingID
        };

        console.log(`📊 Guest ${guestID} feedback check for booking ${latestBookingID}:`, response.hasSubmittedFeedback);
        res.json(response);
      });
    });

  } catch (error) {
    console.error("❌ Error in check-guest:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});

// 🟢 SUBMIT FEEDBACK - AUTOMATICALLY USE LATEST BOOKING
router.post("/submit", (req, res) => {
  const { guestID, rating, comments } = req.body;

  if (!guestID || !rating || !comments) {
    return res.status(400).json({
      success: false,
      message: "Guest ID, rating, and comments are required",
    });
  }

  console.log(`✅ Submitting feedback for guest: ${guestID}`);

  // ✅ STEP 1: GET LATEST COMPLETED BOOKING
  const getLatestBookingSQL = `
    SELECT bookingID FROM tbl_bookings 
    WHERE guestID = ? AND status = 'Completed'
    ORDER BY createdAt DESC 
    LIMIT 1
  `;

  db.query(getLatestBookingSQL, [guestID], (err, bookingResults) => {
    if (err) {
      console.error("❌ Error fetching latest booking:", err);
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    if (bookingResults.length === 0) {
      console.log(`⛔ No completed bookings found for guest ${guestID}`);
      return res.status(400).json({
        success: false,
        message: "No completed bookings found. Please complete a booking first."
      });
    }

    const latestBookingID = bookingResults[0].bookingID;
    console.log(`📋 Using latest booking ID: ${latestBookingID}`);

    // ✅ STEP 2: CHECK IF FEEDBACK ALREADY EXISTS FOR THIS BOOKING
    const checkSql = `
      SELECT feedbackID FROM tbl_feedbacks 
      WHERE guestID = ? AND bookingID = ?
      LIMIT 1
    `;

    db.query(checkSql, [guestID, latestBookingID], (err, results) => {
      if (err) {
        console.error("❌ Error checking existing feedback:", err);
        return res.status(500).json({
          success: false,
          message: "Database error"
        });
      }

      if (results.length > 0) {
        console.log(`⛔ Feedback blocked - Already submitted for booking: ${latestBookingID}`);
        return res.status(400).json({
          success: false,
          message: "Feedback already submitted for your latest booking!"
        });
      }

      // ✅ STEP 3: PROCEED WITH FEEDBACK SUBMISSION
      console.log(`✅ Submitting feedback for guest: ${guestID}, booking: ${latestBookingID}`);

      const insertSql = `
        INSERT INTO tbl_feedbacks (guestID, bookingID, rating, comments)
        VALUES (?, ?, ?, ?)
      `;

      db.query(insertSql, [guestID, latestBookingID, rating, comments], (err, result) => {
        if (err) {
          console.error("❌ Error submitting feedback:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to submit feedback",
          });
        }

        // ✅ MARK ALL NOTIFICATIONS AS READ FOR THIS GUEST
        const markNotifSQL = `
          UPDATE tbl_notifications 
          SET isRead = 1 
          WHERE guestID = ? AND isRead = 0
        `;
        
        db.query(markNotifSQL, [guestID], (err) => {
          if (err) {
            console.error("❌ Error marking notification:", err);
          } else {
            console.log(`✅ All unread notifications marked as read for guest: ${guestID}`);
          }
        });

        res.json({
          success: true,
          message: "Thank you for your feedback!",
          feedbackID: result.insertId,
          bookingID: latestBookingID
        });
      });
    });
  });

  router.get("/check-all-completed/:guestID", async (req, res) => {
  const { guestID } = req.params;

  try {
    const sql = `
      SELECT 
        b.bookingID,
        b.status,
        f.feedbackID
      FROM tbl_bookings b
      LEFT JOIN tbl_feedbacks f ON b.bookingID = f.bookingID
      WHERE b.guestID = ? AND b.status = 'Completed'
    `;

    db.query(sql, [guestID], (err, results) => {
      if (err) {
        console.error("❌ Error checking completed bookings:", err);
        return res.status(500).json({ 
          success: false,
          message: "Database error" 
        });
      }

      // I-check kung may completed booking na walang feedback
      const hasCompletedWithoutFeedback = results.some(booking => !booking.feedbackID);
      
      res.json({
        success: true,
        hasCompletedWithoutFeedback: hasCompletedWithoutFeedback,
        completedBookings: results
      });
    });
  } catch (error) {
    console.error("❌ Error in check-all-completed:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});
});

module.exports = router;