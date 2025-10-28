// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");

// === ADMIN LOGIN ===
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  db.query("SELECT * FROM tbl_admin WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (!results || results.length === 0)
      return res.status(400).json({ message: "Email not found" });

    const admin = results[0];
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });

    // ✅ Login success
    res.json({ message: "Admin login successful", admin: { email: admin.email, adminID: admin.AdminID } });
  });
});


// =======================
// GET ALL BOOKINGS (Guest Records Tab)
// =======================
router.get("/bookings", (req, res) => {
  const sql = `
    SELECT 
      b.bookingID,
      b.guestID,
      CONCAT(g.firstName, ' ', g.lastName) AS guestName,
      b.packageName,
      b.checkinDate,
      b.checkoutDate,
      b.checkinTime,
      b.checkoutTime,
      b.numGuests,
      b.additionalPax,
      b.additionalHours,
      b.basePrice,
      b.totalPrice,
      b.status,
      b.createdAt
    FROM tbl_bookings b
    LEFT JOIN tbl_guests g ON g.guestID = b.guestID
    ORDER BY b.createdAt DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ DB error (bookings):", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
});

// =======================
// UPDATE BOOKING STATUS (Approve/Decline)
// =======================
router.put("/bookings/:id/status", (req, res) => {
  const bookingID = req.params.id;
  const { status } = req.body;

  if (!["Approved", "Declined"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const sql = `UPDATE tbl_bookings SET status = ? WHERE bookingID = ?`;
  db.query(sql, [status, bookingID], (err, result) => {
    if (err) {
      console.error("❌ DB error (update status):", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // ✅ Get guestID for this booking
    const guestQuery = `SELECT guestID FROM tbl_bookings WHERE bookingID = ?`;
    db.query(guestQuery, [bookingID], (err, rows) => {
      if (err) {
        console.error("❌ DB error (get guestID):", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (rows.length === 0) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const guestID = rows[0].guestID;
      let message = "";

      if (status === "Approved") {
        message = "Your booking has been approved! You may now proceed to payment.";
      } else if (status === "Declined") {
        message = "Sorry, your booking was declined by the admin.";
      }

      // ✅ Insert into notifications table
      const notifQuery = `
        INSERT INTO tbl_notifications (guestID, message, isRead, createdAt)
        VALUES (?, ?, 0, NOW())
      `;
      db.query(notifQuery, [guestID, message], (err2) => {
        if (err2) {
          console.error("❌ DB error (insert notif):", err2);
          return res.status(500).json({ message: "Notification insert error" });
        }

        // ✅ Final success response
        res.json({ message: `Booking ${status} successfully and notification sent.` });
      });
    });
  });
});

// // ==========================
// // 📦 GET ALL PACKAGES
// // ==========================
// router.get("/packages", (req, res) => {
//   const sql = "SELECT * FROM tbl_packages";
//   db.query(sql, (err, results) => {
//     if (err) {
//       console.error("❌ DB error (packages):", err);
//       return res.status(500).json({ message: "Database error" });
//     }
//     res.json(results);
//   });
// });

// // ==========================
// // 🧺 GET ALL AMENITIES
// // ==========================
// router.get("/amenities", (req, res) => {
//   const sql = "SELECT * FROM tbl_amenities";
//   db.query(sql, (err, results) => {
//     if (err) {
//       console.error("❌ DB error (amenities):", err);
//       return res.status(500).json({ message: "Database error" });
//     }
//     res.json(results);
//   });
// });



// // GET all guest accounts
// router.get("/guests", (req, res) => {
//   const sql = "SELECT guestID, firstName, lastName, email, contactNo FROM tbl_guests";

//   db.query(sql, (err, results) => {
//     if (err) {
//       console.error("❌ DB error:", err);
//       return res.status(500).json({ message: "Database error" });
//     }

//     res.json(results);
//   });
// });


module.exports = router;
