const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
const groupRoutes = require("./routes/groups");
app.use("/groups", groupRoutes);

const inviteRoutes = require("./routes/invites");
app.use("/invites", inviteRoutes);

app.get("/", (req, res) => {
  res.json({ status: "Stokvel API is running" });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;