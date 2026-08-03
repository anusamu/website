const mongoose = require("mongoose");

const appFeedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // Optional: allow anonymous feedback if they just provide name/email
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["mail", "app_feedback", "support"],
      default: "app_feedback",
    },
    status: {
      type: String,
      enum: ["unread", "read", "resolved"],
      default: "unread",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AppFeedback", appFeedbackSchema);
