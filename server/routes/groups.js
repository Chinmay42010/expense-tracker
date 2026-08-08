const express = require("express");
const router = express.Router();
const Group = require("../models/Group");

// CREATE a new group
router.post("/", async (req, res) => {
  try {
    const group = new Group(req.body);
    const savedGroup = await group.save();
    res.status(201).json(savedGroup);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all groups created by a user
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { createdBy: userId } : {};
    const groups = await Group.find(filter).sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single group by id
router.get("/:id", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
