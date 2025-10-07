const express = require("express");
const helmet = require("helmet");

const app = express();
const PORT = process.env.PORT || 3000;

// Basic hardening and sane limits
app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.status(200).send("🚀 التطبيق يعمل بنجاح على Vercel!");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

// Centralized error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Avoid leaking internals in production
  console.error("Error:", err && err.stack ? err.stack : err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Export the app for serverless environments (Vercel)
module.exports = app;

// Start server only if run as a standalone server (e.g., Render, local)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ الخادم يعمل على المنفذ ${PORT}`);
  });
}
