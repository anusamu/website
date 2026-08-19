const mongoose = require("mongoose");

const weavingStorySchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WeavingStory", weavingStorySchema);
