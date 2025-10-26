// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");

// ===============================
// === SIGNUP (Guests Only) ===
// ===============================
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, contactNo, email, password } = req.body;

    if (!firstName || !lastName || !contactNo || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

<<<<<<< HEAD
    // Trim inputs
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    db.query("SELECT * FROM tbl_guests WHERE email = ?", [cleanEmail], async (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length > 0) {
        return res.status(400).json({ message: "Email already registered" });
      }
=======
    // Check if email already exists in guests table
    db.query("SELECT * FROM tbl_guests WHERE email = ?", [email], async (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length > 0) return res.status(400).json({ message: "Email already registered" });
>>>>>>> cd998cc84cbf11974d15eb714fac78d595a405fa

      const hashedPassword = await bcrypt.hash(cleanPassword, 10);
      const guestID = "G" + Math.floor(100000 + Math.random() * 900000);

      const sql = `
        INSERT INTO tbl_guests (guestID, firstName, lastName, contactNo, email, password)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

<<<<<<< HEAD
      db.query(
        sql,
        [guestID, firstName.trim(), lastName.trim(), contactNo.trim(), cleanEmail, hashedPassword],
        (err) => {
          if (err) return res.status(500).json({ message: "Insert failed" });
          res.json({ message: "Signup successful!" });
        }
      );
=======
      db.query(sql, [guestID, firstName.trim(), lastName.trim(), contactNo.trim(), email.trim(), hashedPassword], (err) => {
        if (err) return res.status(500).json({ message: "Insert failed" });
        return res.json({ message: "Signup successful!" });
      });
>>>>>>> cd998cc84cbf11974d15eb714fac78d595a405fa
    });
  } catch (error) {
    console.error("❌ Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

<<<<<<< HEAD
// === LOGIN ===
=======
// ===============================
// === LOGIN (Guest & Admin) ===
// ===============================
>>>>>>> cd998cc84cbf11974d15eb714fac78d595a405fa
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    // Check admins table first
    db.query("SELECT * FROM tbl_admin WHERE email = ?", [email], async (err, adminResults) => {
      if (err) return res.status(500).json({ message: "Database error" });

<<<<<<< HEAD
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
=======
      if (adminResults.length > 0) {
        const admin = adminResults[0];
        const isMatch = await bcrypt.compare(password.trim(), admin.password);

        if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

        return res.json({
          message: "Admin login successful",
          user: { email: admin.email, isAdmin: true }
        });
      }

      // If not admin, check guests table
      db.query("SELECT * FROM tbl_guests WHERE email = ?", [email], async (err, guestResults) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (!guestResults || guestResults.length === 0) return res.status(400).json({ message: "Email not found" });

        const guest = guestResults[0];
        const storedPassword = guest.password?.toString().trim();
        let isMatch = false;

        if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
          isMatch = await bcrypt.compare(password.trim(), storedPassword);
        } else {
          isMatch = password.trim() === storedPassword;
        }

        if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

        return res.json({
          message: "Login successful",
          user: {
            guestID: guest.guestID,
            firstName: guest.firstName,
            lastName: guest.lastName,
            email: guest.email,
            contactNo: guest.contactNo
          }
        });
      });
>>>>>>> cd998cc84cbf11974d15eb714fac78d595a405fa
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
// === GET ACCOUNT INFO (Guests Only) ===
// ===============================
router.get("/user/:email", (req, res) => {
  const { email } = req.params;

  db.query("SELECT firstName, lastName, email, contactNo FROM tbl_guests WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });

    const user = results[0];
    res.json({
      message: "User fetched successfully",
      user: {
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        contactNo: user.contactNo
      }
    });
  });
});

// ===============================
// === UPDATE PROFILE (Guests Only) ===
// ===============================
router.put("/update-profile", (req, res) => {
  const { fullName, email, contact } = req.body;
  if (!email || !fullName || !contact) return res.status(400).json({ message: "All fields required." });

  const [firstName, ...lastParts] = fullName.split(" ");
  const lastName = lastParts.join(" ");

  db.query(
    "UPDATE tbl_guests SET firstName = ?, lastName = ?, contactNo = ? WHERE email = ?",
    [firstName, lastName, contact, email],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database update failed." });
      if (result.affectedRows === 0) return res.status(404).json({ message: "User not found." });
      res.json({ message: "Profile updated successfully." });
    }
  );
});

module.exports = router;
