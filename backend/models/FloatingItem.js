const mongoose = require("mongoose");

const FloatingItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["emoji", "image"],
      default: "emoji",
      required: true,
    },
    content: {
      type: String, // Emoji string (e.g. "🌸") OR Image URL (e.g. "/uploads/flower.png")
      required: true,
    },
    particleSymbol: {
      type: String,
      default: "✨",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FloatingItem", FloatingItemSchema);