// scripts/db-reset.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
require("dotenv").config();

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "../database.sqlite");

let db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  console.log("⚠️ Resetting database...");

  // Example: create table & insert seed data
  db.run("DROP TABLE IF EXISTS children");
  db.run("CREATE TABLE children (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, age INTEGER)");

  const stmt = db.prepare("INSERT INTO children (name, age) VALUES (?, ?)");
  stmt.run("Ali", 5);
  stmt.run("Sara", 4);
  stmt.finalize();

  console.log("✅ Database reset with seed data");
});

db.close();