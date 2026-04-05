const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ── In-memory store (replace with a real DB later) ──────────────────────────
let groups = [];
let nextId = 1;

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "Stokvel API is running" });
});

// ── GET /groups  → return all groups ─────────────────────────────────────────
app.get("/groups", (req, res) => {
  res.json(groups);
});

// ── POST /groups  → create a new group ───────────────────────────────────────
app.post("/groups", (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "Group name is required" });
  }

  const group = {
    id: nextId++,
    name: name.trim(),
    members: [],
    contributions: [],
    createdAt: new Date().toISOString()
  };

  groups.push(group);
  res.status(201).json(group);
});

// ── POST /groups/:id/join  → add a member to a group ─────────────────────────
app.post("/groups/:id/join", (req, res) => {
  const group = groups.find(g => g.id === parseInt(req.params.id));

  if (!group) {
    return res.status(404).json({ error: "Group not found" });
  }

  const { name } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "Member name is required" });
  }

  if (group.members.includes(name.trim())) {
    return res.status(409).json({ error: "Member already in group" });
  }

  group.members.push(name.trim());
  res.json(group);
});

// ── POST /groups/:id/contributions  → log a contribution ─────────────────────
app.post("/groups/:id/contributions", (req, res) => {
  const group = groups.find(g => g.id === parseInt(req.params.id));

  if (!group) {
    return res.status(404).json({ error: "Group not found" });
  }

  const { memberName, amount } = req.body;

  if (!memberName || !amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: "Valid memberName and amount are required" });
  }

  const contribution = {
    id: group.contributions.length + 1,
    memberName: memberName.trim(),
    amount: Number(amount),
    status: "pending",       // pending | confirmed | missed
    date: new Date().toISOString()
  };

  group.contributions.push(contribution);
  res.status(201).json(contribution);
});

// ── GET /groups/:id/contributions  → view contributions for a group ───────────
app.get("/groups/:id/contributions", (req, res) => {
  const group = groups.find(g => g.id === parseInt(req.params.id));

  if (!group) {
    return res.status(404).json({ error: "Group not found" });
  }

  res.json(group.contributions);
});

// ── PATCH /groups/:id/contributions/:cid  → confirm or flag a contribution ───
app.patch("/groups/:id/contributions/:cid", (req, res) => {
  const group = groups.find(g => g.id === parseInt(req.params.id));

  if (!group) {
    return res.status(404).json({ error: "Group not found" });
  }

  const contribution = group.contributions.find(c => c.id === parseInt(req.params.cid));

  if (!contribution) {
    return res.status(404).json({ error: "Contribution not found" });
  }

  const { status } = req.body;
  const validStatuses = ["pending", "confirmed", "missed"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(", ")}` });
  }

  contribution.status = status;
  res.json(contribution);
});

// ── Start server ──────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app; // exported for Jest/supertest
