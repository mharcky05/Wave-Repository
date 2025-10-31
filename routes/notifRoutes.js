// routes/notifRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// 🟢 Get all notifications for a guest
router.get("/:guestID", async (req, res) => {
  const { guestID } = req.params;
  try {
    const [rows] = await db.promise().query(
      "SELECT notifID, guestID, message, isRead, createdAt FROM tbl_notifications WHERE guestID = ? ORDER BY createdAt DESC",
      [guestID]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🟡 Mark notification as read
router.patch("/mark-read/:notifID", async (req, res) => {
  const { notifID } = req.params;
  try {
    const [result] = await db.promise().query(
      "UPDATE tbl_notifications SET isRead = 1 WHERE notifID = ?",
      [notifID]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    res.json({ success: true, message: "Notification marked as read" });
  } catch (err) {
    console.error("❌ Error marking notification as read:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;