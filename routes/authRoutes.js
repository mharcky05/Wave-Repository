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

    // Check if email already exists in guests table
    db.query("SELECT * FROM tbl_guests WHERE email = ?", [email], async (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length > 0) return res.status(400).json({ message: "Email already registered" });

      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      const guestID = "G" + Math.floor(100000 + Math.random() * 900000);

      const sql = `
        INSERT INTO tbl_guests (guestID, firstName, lastName, contactNo, email, password)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(sql, [guestID, firstName.trim(), lastName.trim(), contactNo.trim(), email.trim(), hashedPassword], (err) => {
        if (err) return res.status(500).json({ message: "Insert failed" });
        return res.json({ message: "Signup successful!" });
      });
    });
  } catch (error) {
    console.error("❌ Unexpected signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
// === LOGIN (Guest & Admin) ===
// ===============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    // Check admins table first
    db.query("SELECT * FROM tbl_admin WHERE email = ?", [email], async (err, adminResults) => {
      if (err) return res.status(500).json({ message: "Database error" });

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
    });
  } catch (error) {
    console.error("❌ Unexpected login error:", error);
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
// === UPDATE PROFILE (Fixed) ===
// ===============================
router.put("/update-profile", (req, res) => {
  const { fullName, email, contact, currentEmail } = req.body;
  
  if (!currentEmail || !fullName || !contact) {
    return res.status(400).json({ message: "All fields required." });
  }

  const [firstName, ...lastParts] = fullName.split(" ");
  const lastName = lastParts.join(" ");

  // Check if new email already exists (if email is being changed)
  if (email !== currentEmail) {
    db.query("SELECT * FROM tbl_guests WHERE email = ? AND email != ?", [email, currentEmail], (err, results) => {
      if (err) return res.status(500).json({ message: "Database error." });
      if (results.length > 0) return res.status(400).json({ message: "Email already exists." });

      // Proceed with update
      updateProfile();
    });
  } else {
    updateProfile();
  }

  function updateProfile() {
    db.query(
      "UPDATE tbl_guests SET firstName = ?, lastName = ?, contactNo = ?, email = ? WHERE email = ?",
      [firstName, lastName, contact, email, currentEmail],
      (err, result) => {
        if (err) {
          console.error("Update error:", err);
          return res.status(500).json({ message: "Database update failed." });
        }
        if (result.affectedRows === 0) return res.status(404).json({ message: "User not found." });
        res.json({ message: "Profile updated successfully." });
      }
    );
  }
});

// ===============================
// ACCOUNT INFO (Fixed)
// ===============================
async function loadAccountInfo() {
    const email = localStorage.getItem("userEmail");
    if (!email) {
        // If no user email, check if admin
        const adminEmail = localStorage.getItem("adminEmail");
        if (adminEmail) {
            accName.textContent = "Administrator";
            accEmail.textContent = adminEmail;
            accContact.textContent = "N/A";
            // Hide edit button for admin
            if (editProfileBtn) editProfileBtn.style.display = "none";
            return;
        }
        return;
    }

    try {
        const res = await fetch(`http://localhost:3000/auth/user/${email}`);
        const data = await res.json();

        if (res.ok && data.user) {
            accName.textContent = data.user.fullName;
            accEmail.textContent = data.user.email;
            accContact.textContent = data.user.contactNo;
            // Show edit button for guest
            if (editProfileBtn) editProfileBtn.style.display = "block";
        }
    } catch (err) {
        console.error("Error loading account info:", err);
    }
}

module.exports = router;
