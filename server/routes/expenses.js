const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");

// CREATE a new expense
router.post("/", async (req, res) => {
  try {
    const expense = new Expense(req.body);
    const savedExpense = await expense.save();
    res.status(201).json(savedExpense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all expenses (filtered by user)
router.get("/", async (req, res) => {
  try {
    const { userId, category } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (category) filter.category = category;
    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// EXPORT expenses as CSV
router.get("/export/csv", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const expenses = await Expense.find({ userId }).sort({ date: -1 });

    const header = "Date,Category,Amount,Note\n";
    const rows = expenses
      .map((e) => {
        const date = new Date(e.date).toLocaleDateString("en-IN");
        const note = (e.note || "").replace(/,/g, ";");
        return `${date},${e.category},${e.amount},${note}`;
      })
      .join("\n");

    const csv = header + rows;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=expenses.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE an expense by id
router.put("/:id", async (req, res) => {
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!updatedExpense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.json(updatedExpense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE an expense by id
router.delete("/:id", async (req, res) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);
    if (!deletedExpense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET recurring expenses that are due
router.get("/recurring/due", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const recurringExpenses = await Expense.find({ userId, isRecurring: true });

    const now = new Date();
    const due = recurringExpenses.filter((exp) => {
      const lastDate = new Date(exp.date);
      const daysSince = (now - lastDate) / (1000 * 60 * 60 * 24);
      if (exp.recurrence === "weekly") return daysSince >= 7;
      if (exp.recurrence === "monthly") return daysSince >= 30;
      return false;
    });

    res.json(due);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
