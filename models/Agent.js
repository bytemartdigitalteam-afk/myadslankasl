const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    whatsapp: {
      type: String,
      required: true,
    },
    logoUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Agent", agentSchema);
