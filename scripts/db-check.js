// scripts/db-check.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
require("dotenv").config();

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "../database.sqlite");

let db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("❌ Database check failed:", err.message);
    process.exit(1);
  } else {
    console.log("✅ Database connection successful:", DB_PATH);
    process.exit(0);
  }
});