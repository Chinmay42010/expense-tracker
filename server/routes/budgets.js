const express = require("express");
const router = express.Router();
const Budget = require("../models/Budget");
const Expense = require("../models/Expense");

// CREATE or UPDATE a budget (upsert by userId + category)
router.post("/", async (req, res) => {
  try {
    const { userId, category, limit } = req.body;
    const cat = category || "Overall";

    const budget = await Budget.findOneAndUpdate(
      { userId, category: cat },
      { limit },
      { new: true, upsert: true },
    );

    res.status(200).json(budget);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a budget by userId + category
router.delete("/", async (req, res) => {
  try {
    const { userId, category } = req.query;
    if (!userId || !category) {
      return res.status(400).json({ error: "userId and category are required" });
    }

    const deleted = await Budget.findOneAndDelete({ userId, category });
    if (!deleted) return res.status(404).json({ error: "Budget not found" });

    res.json({ message: "Budget deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET all budgets for a user, with current month's spend calculated
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const budgets = await Budget.find({ userId });
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const result = await Promise.all(
      budgets.map(async (budget) => {
        const filter = {
          userId,
          date: { $gte: startOfMonth },
        };
        if (budget.category !== "Overall") {
          filter.category = budget.category;
        }

        const expenses = await Expense.find(filter);
        const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
        const percentUsed =
          budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0;

        return {
          _id: budget._id,
          category: budget.category,
          limit: budget.limit,
          spent,
          percentUsed,
        };
      }),
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
