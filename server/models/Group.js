const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    members: [
      {
        type: String, // storing member names/emails as simple strings for now
        required: true,
      },
    ],
    createdBy: {
      type: String, // Supabase user ID of the creator
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Group", groupSchema);
