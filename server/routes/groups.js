const express = require("express");
const router = express.Router();
const Group = require("../models/Group");
const GroupExpense = require("../models/GroupExpense");

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

// DELETE a group by id (cascades to its expenses)
router.delete("/:id", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (req.body.userId && group.createdBy !== req.body.userId) {
      return res.status(403).json({ error: "Only the creator can delete this group" });
    }

    await GroupExpense.deleteMany({ groupId: group._id });
    await Group.findByIdAndDelete(group._id);

    res.json({ message: "Group deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
