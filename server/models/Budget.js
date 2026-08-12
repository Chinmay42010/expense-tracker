const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "Overall", // 'Overall' or a specific category like 'Food'
    },
    limit: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

// Ensure one budget per user per category (no duplicates)
budgetSchema.index({ userId: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);
