// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");

// === SIGNUP ===
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, contactNo, email, password } = req.body;

    console.log("📥 Signup request received:", req.body);

    if (!firstName || !lastName || !contactNo || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists
    db.query("SELECT * FROM tbl_guests WHERE email = ?", [email], async (err, results) => {
      if (err) {
        console.error("❌ DB select error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      const guestID = "G" + Math.floor(100000 + Math.random() * 900000);

      const sql = `
        INSERT INTO tbl_guests (guestID, firstName, lastName, contactNo, email, password)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(sql, [guestID, firstName.trim(), lastName.trim(), contactNo.trim(), email.trim(), hashedPassword], (err) => {
        if (err) {
          console.error("❌ DB insert error:", err);
          return res.status(500).json({ message: "Insert failed" });
        }

        console.log("✅ Signup success for:", email);
        res.json({ message: "Signup successful!" });
      });
    });
  } catch (error) {
    console.error("❌ Unexpected signup error:", error);
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

    db.query("SELECT * FROM tbl_guests WHERE email = ?", [email], async (err, results) => {
      if (err) {
        console.error("❌ DB select error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (!results || results.length === 0) {
        console.log("🔍 No user found for:", email);
        return res.status(400).json({ message: "Email not found" });
      }

      const user = results[0];
      const enteredPassword = password.trim();
      const storedPassword = user.password?.toString().trim();

      console.log("🔍 Login attempt for:", email);
      console.log("Entered:", enteredPassword);
      console.log("Stored (first 10 chars):", storedPassword?.slice(0, 10));

      // ✅ Try bcrypt comparison first
      let isMatch = false;
      if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
        try {
          isMatch = await bcrypt.compare(enteredPassword, storedPassword);
          console.log("🧩 bcrypt.compare result:", isMatch);
        } catch (compareErr) {
          console.error("⚠️ bcrypt.compare error:", compareErr);
        }
      } else {
        // Fallback for plain text (for older accounts or testing)
        isMatch = enteredPassword === storedPassword;
        console.log("🧩 Plain comparison result:", isMatch);
      }

      if (!isMatch) {
        console.log("❌ Incorrect password for:", email);
        return res.status(400).json({ message: "Incorrect password" });
      }

      console.log("✅ Login success for:", email);
      const { password: _, ...safeUser } = user;
      return res.json({ message: "Login successful", user: safeUser });
    });
  } catch (error) {
    console.error("❌ Unexpected login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// === GET ACCOUNT INFO ===
router.get("/user/:email", (req, res) => {
  const { email } = req.params;

  db.query("SELECT firstName, lastName, email, contactNo FROM tbl_guests WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("❌ DB select error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

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

// === UPDATE PROFILE ===
router.put("/update-profile", (req, res) => {
  const { fullName, email, contact } = req.body;

  if (!email || !fullName || !contact)
    return res.status(400).json({ message: "All fields required." });

  const [firstName, ...lastParts] = fullName.split(" ");
  const lastName = lastParts.join(" ");

  db.query(
    "UPDATE tbl_guests SET firstName = ?, lastName = ?, contactNo = ? WHERE email = ?",
    [firstName, lastName, contact, email],
    (err, result) => {
      if (err) {
        console.error("❌ DB update error:", err);
        return res.status(500).json({ message: "Database update failed." });
      }

      if (result.affectedRows === 0)
        return res.status(404).json({ message: "User not found." });

      res.json({ message: "Profile updated successfully." });
    }
  );
});


module.exports = router;
