// routes/feedbackRoutes.js
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
      b.packageName
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

// 🟢 REQUEST FEEDBACK FROM GUEST
// router.post("/request", (req, res) => {
//   const { guestID, bookingID } = req.body;

//   if (!guestID) {
//     return res.status(400).json({ message: "Guest ID is required" });
//   }

//   // Send notification to guest
//   const message = "Please provide feedback for your recent stay at L'Escapade";
//   const notifSql = `
//     INSERT INTO tbl_notifications (guestID, message, isRead, createdAt)
//     VALUES (?, ?, 0, NOW())
//   `;

//   db.query(notifSql, [guestID, message], (err, result) => {
//     if (err) {
//       console.error("❌ Error sending feedback request:", err);
//       return res.status(500).json({ message: "Failed to send feedback request" });
//     }

//     res.json({ 
//       success: true, 
//       message: "Feedback request sent to guest" 
//     });
//   });
// });

// 🟢 SUBMIT FEEDBACK (from guest)
router.post("/submit", (req, res) => {
  const { guestID, bookingID, rating, comments } = req.body;

  if (!guestID || !rating || !comments) {
    return res.status(400).json({ 
      success: false, 
      message: "Guest ID, rating, and comments are required" 
    });
  }

  const sql = `
    INSERT INTO tbl_feedbacks (guestID, bookingID, rating, comments)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [guestID, bookingID, rating, comments], (err, result) => {
    if (err) {
      console.error("❌ Error submitting feedback:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to submit feedback" 
      });
    }

    res.json({ 
      success: true, 
      message: "Thank you for your feedback!" 
    });
  });
});

module.exports = router;