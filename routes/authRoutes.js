// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");

// === SIGNUP ===
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, contactNo, email, password } = req.body;

    if (!firstName || !lastName || !contactNo || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Trim inputs
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    db.query("SELECT * FROM tbl_guests WHERE email = ?", [cleanEmail], async (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length > 0) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(cleanPassword, 10);
      const guestID = "G" + Math.floor(100000 + Math.random() * 900000);

      const sql = `
        INSERT INTO tbl_guests (guestID, firstName, lastName, contactNo, email, password)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(
        sql,
        [guestID, firstName.trim(), lastName.trim(), contactNo.trim(), cleanEmail, hashedPassword],
        (err) => {
          if (err) return res.status(500).json({ message: "Insert failed" });
          res.json({ message: "Signup successful!" });
        }
      );
    });
  } catch (error) {
    console.error("❌ Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// === LOGIN ===
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    db.query("SELECT * FROM tbl_guests WHERE email = ?", [cleanEmail], async (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (!results || results.length === 0) {
        return res.status(400).json({ message: "Email not found" });
      }

      const user = results[0];
      const storedPassword = user.password?.toString().trim();

      console.log("🔍 Login attempt for:", cleanEmail);
      console.log("Entered:", cleanPassword);
      console.log("Stored (first 10 chars):", storedPassword?.slice(0, 10));

      const isMatch = await bcrypt.compare(cleanPassword, storedPassword);

      console.log("🧩 bcrypt.compare result:", isMatch);

      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect password" });
      }

      console.log("✅ Login success for:", cleanEmail);
      const { password: _, ...safeUser } = user;
      return res.json({ message: "Login successful", user: safeUser });
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
