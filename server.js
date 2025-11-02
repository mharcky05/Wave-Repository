// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const db = require("./db");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notifRoutes = require("./routes/notifRoutes");
const transacRoutes = require("./routes/transacRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());


// ✅ Serve your static files correctly
app.use(express.static(path.join(__dirname, "html")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/images", express.static(path.join(__dirname, "images")));

// API routes
app.use("/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/notifications", notifRoutes);
app.use("/api/payments", transacRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/admin", adminRoutes);


app.post("/notifications/send", (req, res) => {
  const { guestID, message } = req.body;

  const sql = "INSERT INTO tbl_notifications (guestID, message) VALUES (?, ?)";
  db.query(sql, [guestID, message], (err, result) => {
    if (err) {
      console.error("❌ Notification insert error:", err);
      return res.status(500).json({ message: "Notification insert error" });
    }
    res.json({ message: "✅ Notification sent successfully" });
  });
});

// GET /notifications/:guestID
app.get("/notifications/:guestID", (req, res) => {
  const guestID = req.params.guestID;

  const sql = "SELECT * FROM tbl_notifications WHERE guestID = ? ORDER BY created_at DESC";
  db.query(sql, [guestID], (err, result) => {
    if (err) {
      console.error("❌ Fetch notifications error:", err);
      return res.status(500).json({ message: "Error fetching notifications" });
    }
    res.json(result);
  });
});

// PATCH /notifications/mark-read/:guestID
app.patch("/notifications/mark-read/:guestID", (req, res) => {
  const guestID = req.params.guestID;
  const sql = "UPDATE tbl_notifications SET isRead = TRUE WHERE guestID = ?";
  db.query(sql, [guestID], (err, result) => {
    if (err) return res.status(500).json({ message: "Error marking as read" });
    res.json({ message: "✅ Notifications marked as read" });
  });
});

// Default route — serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "index.html"));
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
