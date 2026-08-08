const express = require("express");
const router = express.Router();
const GroupExpense = require("../models/GroupExpense");

// CREATE a new group expense
router.post("/:groupId", async (req, res) => {
  try {
    const { amount, paidBy, category, note, splitBetween } = req.body;

    const groupExpense = new GroupExpense({
      groupId: req.params.groupId,
      amount,
      paidBy,
      category,
      note,
      splitBetween,
    });

    const saved = await groupExpense.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

function calculateSettlements(balances) {
  const creditors = [];
  const debtors = [];

  for (const [person, amount] of Object.entries(balances)) {
    if (amount > 0.01) creditors.push({ person, amount });
    else if (amount < -0.01) debtors.push({ person, amount: -amount });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let i = 0,
    j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const settledAmount = Math.min(debtor.amount, creditor.amount);

    settlements.push({
      from: debtor.person,
      to: creditor.person,
      amount: Math.round(settledAmount * 100) / 100,
    });

    debtor.amount -= settledAmount;
    creditor.amount -= settledAmount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return settlements;
}

// GET all expenses for a group, with balance calculation
router.get("/:groupId", async (req, res) => {
  try {
    const expenses = await GroupExpense.find({
      groupId: req.params.groupId,
    }).sort({ date: -1 });

    const balances = {};

    expenses.forEach((exp) => {
      const share = exp.amount / exp.splitBetween.length;
      exp.splitBetween.forEach((member) => {
        if (!balances[member]) balances[member] = 0;
        if (member === exp.paidBy) {
          balances[member] += exp.amount - share;
        } else {
          balances[member] -= share;
        }
      });
    });

    const settlements = calculateSettlements(balances);

    res.json({ expenses, balances, settlements });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
