// routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db");

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

  // ======= CHECK FOR PAST DATES =======
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkin = new Date(checkinDate);
  const checkout = new Date(checkoutDate);

  if (checkin < today || checkout < today) {
    return res.status(400).json({ message: "⚠️ Booking for past dates is not allowed." });
  }

  // Make sure numeric values are numbers
  const basePriceNum = Number(basePrice) || 0;
  const totalPriceNum = Number(totalPrice) || 0;
  const numGuestsNum = Number(numGuests) || 0;
  const additionalPaxNum = Number(additionalPax) || 0;
  const additionalHoursNum = Number(additionalHours) || 0;

  // ========== DATE CONFLICT CHECK ==========
  const conflictSql = `
    SELECT * FROM tbl_bookings
    WHERE guestID = ? AND
          ((checkinDate <= ? AND checkoutDate >= ?) OR
           (checkinDate <= ? AND checkoutDate >= ?) OR
           (checkinDate >= ? AND checkoutDate <= ?))
  `;

  db.query(
    conflictSql,
    [
      guestID,
      checkinDate, checkinDate,
      checkoutDate, checkoutDate,
      checkinDate, checkoutDate
    ],
    (err, results) => {
      if (err) {
        console.error("❌ Booking conflict check error:", err);
        return res.status(500).json({ message: "Database error: " + err.message });
      }
      if (results.length > 0) {
        return res.status(400).json({ message: "⚠️ The selected date is already reserved." });
      }

      // ===== INSERT BOOKING =====
      const bookingID = "B" + Math.floor(100000 + Math.random() * 900000);
      
      // FIXED SQL - 12 parameters only (walang duplicate status)
      const sql = `
        INSERT INTO tbl_bookings
        (bookingID, guestID, packageName, checkinDate, checkoutDate,
         checkinTime, checkoutTime, numGuests, additionalPax, additionalHours,
         basePrice, totalPrice, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
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
          totalPriceNum
          // Status 'Pending' is already in the SQL VALUES
        ],
        (err) => {
          if (err) {
            console.error("❌ Booking insert error:", err);
            return res.status(500).json({ message: "Database error: " + err.message });
          }

          return res.json({ 
            message: "Booking submitted for admin approval! You will be notified once approved." 
          });
        }
      );
    }
  );
});

// 🟢 Get latest APPROVED booking for a guest
router.get("/latest/:guestID", async (req, res) => {
  const { guestID } = req.params;
  
  try {
    const [rows] = await db.promise().query(
      `SELECT * FROM tbl_bookings 
       WHERE guestID = ? AND status = 'Approved'
       ORDER BY createdAt DESC LIMIT 1`,
      [guestID]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "No approved bookings found" });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error fetching latest booking:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🟢 Get all bookings for a guest
router.get("/guest/:guestID", async (req, res) => {
  const { guestID } = req.params;
  
  try {
    const [rows] = await db.promise().query(
      `SELECT * FROM tbl_bookings 
       WHERE guestID = ? 
       ORDER BY createdAt DESC`,
      [guestID]
    );
    
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching guest bookings:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;