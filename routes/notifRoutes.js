// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// 🟢 Get all notifications for a guest
router.get("/:guestID", async (req, res) => {
  const { guestID } = req.params;
  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM tbl_notifications WHERE guestID = ? ORDER BY createdAt DESC",
      [guestID]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🟡 Mark all notifications as read
router.put("/:guestID/read", async (req, res) => {
  const { guestID } = req.params;
  try {
    await db.promise().query(
      "UPDATE tbl_notifications SET isRead = 1 WHERE guestID = ?",
      [guestID]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error updating notifications:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
