// server.js
const express = require("express");
const morgan = require("morgan");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "database.sqlite");

// Middlewares
app.use(express.json());
app.use(morgan("dev"));
// Serve static files if present to ensure root path responds
app.use(express.static(path.join(__dirname, "public")));

// Database connection
let db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("❌ Database connection error:", err.message);
  } else {
    console.log("✅ Connected to SQLite database at", DB_PATH);
  }
});

// Health endpoint
app.get("/", (req, res) => {
  res.status(200).send("OK");
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "System is healthy" });
});

// Performance endpoint (بسيط للتجربة)
app.get("/api/performance/health", (req, res) => {
  const start = Date.now();
  db.all("SELECT 1", [], () => {
    const duration = Date.now() - start;
    res.json({ status: "ok", responseTimeMs: duration });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});