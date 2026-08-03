const AppFeedback = require("../models/AppFeedback");

// Public/User: Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { name, email, message, type } = req.body;
    const userId = req.user ? (req.user._id || req.user.id) : null;

    const feedback = await AppFeedback.create({
      user: userId,
      name,
      email,
      message,
      type: type || "app_feedback"
    });

    res.status(201).json({ success: true, feedback, message: "Feedback submitted successfully." });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ success: false, message: "Failed to submit feedback." });
  }
};

// Admin: Get all feedback
exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await AppFeedback.find()
      .populate("user", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update feedback status
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const feedback = await AppFeedback.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    res.status(200).json({ success: true, feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await AppFeedback.findByIdAndDelete(id);

    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    res.status(200).json({ success: true, message: "Feedback deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
