const mongoose = require("mongoose");

const groupExpenseSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paidBy: {
      type: String, // member name who paid
      required: true,
    },
    category: {
      type: String,
      default: "Other",
    },
    note: {
      type: String,
      default: "",
    },
    splitBetween: [
      {
        type: String, // member names sharing this expense
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("GroupExpense", groupExpenseSchema);
