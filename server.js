const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => {
  res.send("🚀 App is running successfully on Render!");
});

// Healthcheck endpoint for uptime monitoring and deployment verification
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});
app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
});
