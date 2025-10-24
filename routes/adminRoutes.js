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

module.exports = router;
