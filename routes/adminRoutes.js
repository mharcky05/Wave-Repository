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
