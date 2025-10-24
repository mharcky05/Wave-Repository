// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const db = require("./db");
const bookingRoutes = require("./routes/bookingRoutes");

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

// Default route — serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "index.html"));
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));

