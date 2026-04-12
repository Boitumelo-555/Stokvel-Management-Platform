const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
const groupRoutes = require("./routes/groups");
const inviteRoutes = require("./routes/invites");

app.use("/groups", groupRoutes);
app.use("/invites", inviteRoutes);

app.get("/api", (req, res) => {
  res.json({ status: "Stokvel API is running" });
});

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;