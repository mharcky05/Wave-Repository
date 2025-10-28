// const db = require("./db.js"); // your DB connection
// const bcrypt = require("bcryptjs");

// async function createAdmin(email, password) {
//   const hashed = await bcrypt.hash(password, 10);
//   db.query(
//     "INSERT INTO tbl_admin (email, password) VALUES (?, ?)",
//     [email, hashed],
//     (err, result) => {
//       if (err) console.error("❌ DB error:", err);
//       else console.log("✅ Admin account created:", email);
//       process.exit();
//     }
//   );
// }

// // Replace with your email & password
// createAdmin("admin@lescapade.com", "Admin_123");
