const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: String,
      required: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrence: {
      type: String, // 'weekly' or 'monthly'
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Expense", expenseSchema);
