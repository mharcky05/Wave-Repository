const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("./emailService");

// ===============================
// === SIGNUP (Guests Only) ===
// ===============================
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, contactNo, email, password } = req.body;

    console.log("🔍 SIGNUP DEBUG START =================");
    console.log("Signup data:", { firstName, lastName, contactNo, email });

    if (!firstName || !lastName || !contactNo || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists in guests table
    db.query(
      "SELECT * FROM tbl_guests WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          console.error("❌ Email check error:", err);
          return res.status(500).json({ message: "Database error" });
        }

        console.log("🔍 Existing users with this email:", results.length);

        if (results.length > 0) {
          console.log("❌ Email already registered");
          return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password.trim(), 10);
        const guestID = "G" + Math.floor(100000 + Math.random() * 900000);

        // Gumawa ng verification token
        const verificationToken =
          Math.random().toString(36).substring(2) + Date.now().toString(36);

        console.log("🔍 Generated guestID:", guestID);
        console.log("🔍 Generated verificationToken:", verificationToken);
        console.log("🔍 Token length:", verificationToken.length);

        const sql = `
        INSERT INTO tbl_guests (guestID, firstName, lastName, contactNo, email, password, user_type, verification_token)
        VALUES (?, ?, ?, ?, ?, ?, 'guest', ?)
      `;

        console.log("🔍 Executing INSERT query...");

        db.query(
          sql,
          [
            guestID,
            firstName.trim(),
            lastName.trim(),
            contactNo.trim(),
            email.trim(),
            hashedPassword,
            verificationToken,
          ],
          (err, result) => {
            if (err) {
              console.error("❌ INSERT error:", err);
              return res.status(500).json({ message: "Insert failed" });
            }

            console.log("🔍 INSERT successful, inserted ID:", result.insertId);

            // Verify na na-save ang token
            const verifyQuery =
              "SELECT verification_token FROM tbl_guests WHERE guestID = ?";
            db.query(verifyQuery, [guestID], (verifyErr, verifyResults) => {
              if (verifyErr) {
                console.error("❌ Verify token error:", verifyErr);
              } else {
                console.log(
                  "🔍 Stored token verification:",
                  verifyResults[0]?.verification_token
                );
                console.log(
                  "🔍 Token match:",
                  verifyResults[0]?.verification_token === verificationToken
                );
              }

              // Magpadala ng verification email
              const emailSubject = "Verify Your Email - L'Escapade Resort";
              const emailMessage = `Kamusta ${firstName},\n\nSalamat sa pag-sign up sa L\'Escapade Resort booking system!\n\nPakiverify ang iyong email address gamit ang code na ito:\n\nVerification Code: ${verificationToken}\n\nKung hindi ikaw ang nag-sign up, paki-ignore na lang ang email na ito.\n\nSalamat,\nL\'Escapade Resort Team`;

              console.log("🔍 Sending email with token:", verificationToken);
              sendEmail(email, emailSubject, emailMessage);

              console.log("🔍 SIGNUP DEBUG END =================");

              return res.json({
                message:
                  "Signup successful! Please check your email for verification.",
                needsVerification: true,
              });
            });
          }
        );
      }
    );
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
    const { email, password, userType } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });
    if (!userType)
      return res.status(400).json({ message: "Please select user type" });

    if (userType === "admin") {
      // Check admins table
      db.query(
        "SELECT * FROM tbl_admin WHERE email = ?",
        [email],
        async (err, adminResults) => {
          if (err) return res.status(500).json({ message: "Database error" });
          if (adminResults.length === 0)
            return res.status(400).json({ message: "Admin email not found" });

          const admin = adminResults[0];
          const isMatch = await bcrypt.compare(password.trim(), admin.password);

          if (!isMatch)
            return res.status(400).json({ message: "Incorrect password" });

          // Magpadala ng login notification email para sa admin
          const emailSubject =
            "May Nag-login sa Admin Account Mo - L'Escapade Resort";
          const emailMessage = `Kamusta ${
            admin.username || "Admin"
          },\n\nMay nag-login ngayon sa iyong admin account.\n\nKung ikaw ito, okay lang. Kung hindi, pakicontact agad ang system administrator.\n\nIngat,\nL\'Escapade Resort System`;

          sendEmail(email, emailSubject, emailMessage);

          return res.json({
            message: "Admin login successful",
            user: {
              email: admin.email,
              isAdmin: true,
              name: admin.username || "Administrator",
            },
          });
        }
      );
    } else {
      // Check guests table
      db.query(
        "SELECT * FROM tbl_guests WHERE email = ?",
        [email],
        async (err, guestResults) => {
          if (err) return res.status(500).json({ message: "Database error" });
          if (!guestResults || guestResults.length === 0)
            return res.status(400).json({ message: "Email not found" });

          const guest = guestResults[0];
          const storedPassword = guest.password?.toString().trim();
          let isMatch = false;

          // Check kung verified na ang guest
          if (!guest.is_verified) {
            return res.status(400).json({
              message: "Please verify your email first before logging in",
            });
          }

          if (
            storedPassword.startsWith("$2a$") ||
            storedPassword.startsWith("$2b$") ||
            storedPassword.startsWith("$2y$")
          ) {
            isMatch = await bcrypt.compare(password.trim(), storedPassword);
          } else {
            isMatch = password.trim() === storedPassword;
          }

          if (!isMatch)
            return res.status(400).json({ message: "Incorrect password" });

          // Magpadala ng login notification email para sa guest
          const emailSubject =
            "May Nag-login sa Account Mo - L'Escapade Resort";
          const emailMessage = `Kamusta ${guest.firstName},\n\nMay nag-login ngayon sa iyong guest account.\n\nKung ikaw ito, okay lang. Kung hindi, pakipalitan agad ang password mo.\n\nSalamat,\nL\'Escapade Resort Team`;

          sendEmail(email, emailSubject, emailMessage);

          return res.json({
            message: "Login successful",
            user: {
              guestID: guest.guestID,
              firstName: guest.firstName,
              lastName: guest.lastName,
              email: guest.email,
              contactNo: guest.contactNo,
              isAdmin: false,
            },
          });
        }
      );
    }
  } catch (error) {
    console.error("❌ Unexpected login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
// === EMAIL VERIFICATION ===
// ===============================
router.post("/verify-email", (req, res) => {
  const { email, token } = req.body;

  console.log("🔍 VERIFICATION DEBUG START =================");
  console.log("Email received:", email);
  console.log("Token received:", token);
  console.log("Token length:", token?.length);

  if (!email || !token) {
    console.log("❌ Missing email or token");
    return res
      .status(400)
      .json({ message: "Email and verification token required" });
  }

  // Check what's actually in the database
  const debugQuery =
    "SELECT guestID, email, is_verified, verification_token FROM tbl_guests WHERE email = ?";
  db.query(debugQuery, [email], (err, results) => {
    if (err) {
      console.error("❌ Debug query error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    console.log("🔍 Database query results:", results);

    if (results.length === 0) {
      console.log("❌ No user found with email:", email);
      return res.status(400).json({ message: "Email not found" });
    }

    const user = results[0];
    console.log("🔍 User found:", user.guestID);
    console.log("🔍 Stored token:", user.verification_token);
    console.log("🔍 Stored token length:", user.verification_token?.length);
    console.log("🔍 Is verified:", user.is_verified);

    // Check exact match
    const isExactMatch = user.verification_token === token;
    console.log("🔍 Exact token match:", isExactMatch);

    // Check if tokens are similar
    if (!isExactMatch) {
      console.log(
        "🔍 First 10 chars - Stored:",
        user.verification_token?.substring(0, 10)
      );
      console.log("🔍 First 10 chars - Received:", token?.substring(0, 10));
    }

    // Try the verification
    const query =
      "UPDATE tbl_guests SET is_verified = 1 WHERE email = ? AND verification_token = ?";
    console.log("🔍 Executing verification query...");

    db.query(query, [email, token], (err, result) => {
      if (err) {
        console.error("❌ Verification query error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      console.log(
        "🔍 Verification result - Affected rows:",
        result.affectedRows
      );
      console.log("🔍 VERIFICATION DEBUG END =================");

      if (result.affectedRows === 0) {
        return res.status(400).json({ message: "Invalid verification token" });
      }

      res.json({ message: "Email verified successfully" });
    });
  });
});

// ===============================
// === GET ACCOUNT INFO (Guests Only) ===
// ===============================
router.get("/user/:email", (req, res) => {
  const { email } = req.params;

  db.query(
    "SELECT firstName, lastName, email, contactNo FROM tbl_guests WHERE email = ?",
    [email],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length === 0)
        return res.status(404).json({ message: "User not found" });

      const user = results[0];
      res.json({
        message: "User fetched successfully",
        user: {
          fullName: `${user.firstName} ${user.lastName}`,
          email: user.email,
          contactNo: user.contactNo,
        },
      });
    }
  );
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
    db.query(
      "SELECT * FROM tbl_guests WHERE email = ? AND email != ?",
      [email, currentEmail],
      (err, results) => {
        if (err) return res.status(500).json({ message: "Database error." });
        if (results.length > 0)
          return res.status(400).json({ message: "Email already exists." });

        // Proceed with update
        updateProfile();
      }
    );
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
        if (result.affectedRows === 0)
          return res.status(404).json({ message: "User not found." });
        res.json({ message: "Profile updated successfully." });
      }
    );
  }
});

// ===============================
// === TEST EMAIL SENDING ===
// ===============================
router.post("/test-email", (req, res) => {
  const { email } = req.body;

  console.log("📧 Testing email sending to:", email);

  const emailSubject = "Test Email - L'Escapade Resort";
  const emailMessage = `Ito ay test email lang. Kung natanggap mo ito, gumagana ang email system.`;

  sendEmail(email, emailSubject, emailMessage);

  res.json({ message: "Test email sent. Check server logs and email." });
});

module.exports = router;
