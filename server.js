const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => {
  res.send("🚀 App is running successfully on Render!");
});
app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
});
