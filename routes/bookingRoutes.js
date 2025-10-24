// routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db"); // your MySQL connection

// POST /api/bookings/book
router.post("/book", (req, res) => {
  const {
    guestID,
    packageName,
    checkinDate,
    checkoutDate,
    checkinTime,
    checkoutTime,
    numGuests,
    additionalPax,
    additionalHours,
    basePrice,
    totalPrice,
  } = req.body;

  // Basic validation
  if (!guestID || !packageName || !checkinDate || !checkoutDate || !checkinTime || !checkoutTime) {
    return res.status(400).json({ message: "Required fields missing." });
  }

  const bookingID = "B" + Math.floor(100000 + Math.random() * 900000);

  // Make sure numeric values are numbers
  const basePriceNum = Number(basePrice) || 0;
  const totalPriceNum = Number(totalPrice) || 0;
  const numGuestsNum = Number(numGuests) || 0;
  const additionalPaxNum = Number(additionalPax) || 0;
  const additionalHoursNum = Number(additionalHours) || 0;

  const sql = `
    INSERT INTO tbl_bookings
    (bookingID, guestID, packageName, checkinDate, checkoutDate,
     checkinTime, checkoutTime, numGuests, additionalPax, additionalHours,
     basePrice, totalPrice, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      bookingID,
      guestID,
      packageName,
      checkinDate,
      checkoutDate,
      checkinTime,
      checkoutTime,
      numGuestsNum,
      additionalPaxNum,
      additionalHoursNum,
      basePriceNum,
      totalPriceNum,
      "Pending",
    ],
    (err) => {
      if (err) {
        console.error("❌ Booking insert error:", err);
        return res.status(500).json({ message: "Database error: " + err.message });
      }

      return res.json({ message: "Booking confirmed successfully!" });
    }
  );
});

module.exports = router;
