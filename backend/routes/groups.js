const express = require("express");
const router = express.Router();

// Temporary in-memory store until Azure PostgreSQL is ready
// When DB is ready, replace these with actual pg queries
let groups = [];
let nextId = 1;

// POST /groups — create a new group
// Task #7
router.post("/", async (req, res) => {
  const {
    name,
    contribution_amount,
    payout_order,
    meeting_frequency,
    contribution_due_day
  } = req.body;

  // Validation
  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "Group name is required" });
  }

  if (!contribution_amount || isNaN(contribution_amount) || Number(contribution_amount) <= 0) {
    return res.status(400).json({ error: "A valid contribution amount is required" });
  }

  if (!meeting_frequency) {
    return res.status(400).json({ error: "Meeting frequency is required" });
  }

  const group = {
    id: nextId++,
    name: name.trim(),
    contribution_amount: Number(contribution_amount),
    payout_order: payout_order || "round-robin",
    meeting_frequency: meeting_frequency,
    contribution_due_day: contribution_due_day || "1st of the month",
    members: [],
    created_at: new Date().toISOString()
  };

  groups.push(group);
  res.status(201).json(group);
});

// GET /groups — list all groups
router.get("/", async (req, res) => {
  res.json(groups);
});

// GET /groups/:id — get a single group
router.get("/:id", async (req, res) => {
  const group = groups.find(g => g.id === parseInt(req.params.id));
  if (!group) return res.status(404).json({ error: "Group not found" });
  res.json(group);
});

// PATCH /groups/:id — update group config
router.patch("/:id", async (req, res) => {
  const group = groups.find(g => g.id === parseInt(req.params.id));
  if (!group) return res.status(404).json({ error: "Group not found" });

  const {
    name,
    contribution_amount,
    payout_order,
    meeting_frequency,
    contribution_due_day
  } = req.body;

  if (name) group.name = name.trim();
  if (contribution_amount) group.contribution_amount = Number(contribution_amount);
  if (payout_order) group.payout_order = payout_order;
  if (meeting_frequency) group.meeting_frequency = meeting_frequency;
  if (contribution_due_day) group.contribution_due_day = contribution_due_day;

  res.json(group);
});

// DELETE /groups/:id — archive a group
router.delete("/:id", async (req, res) => {
  const index = groups.findIndex(g => g.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Group not found" });

  groups.splice(index, 1);
  res.json({ message: "Group archived successfully" });
});

module.exports = router;