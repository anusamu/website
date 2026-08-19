const WeavingStory = require("../models/WeavingStory");
const path = require("path");
const fs = require("fs");

exports.getAllStories = async (req, res) => {
  try {
    const stories = await WeavingStory.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: stories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching stories", error: error.message });
  }
};

exports.getActiveStories = async (req, res) => {
  try {
    const stories = await WeavingStory.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: stories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching active stories", error: error.message });
  }
};

exports.createStory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }
    const imageUrl = req.file.path || req.file.secure_url;
    const newStory = new WeavingStory({ imageUrl });
    await newStory.save();
    res.status(201).json({ success: true, data: newStory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating story", error: error.message });
  }
};

exports.toggleStoryStatus = async (req, res) => {
  try {
    const story = await WeavingStory.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: "Story not found" });

    story.isActive = !story.isActive;
    await story.save();
    res.status(200).json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error toggling status", error: error.message });
  }
};

exports.deleteStory = async (req, res) => {
  try {
    const story = await WeavingStory.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: "Story not found" });

    // Note: Cloudinary image deletion logic could be added here if needed

    await story.deleteOne();
    res.status(200).json({ success: true, message: "Story deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting story", error: error.message });
  }
};

exports.likeStory = async (req, res) => {
  try {
    const story = await WeavingStory.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: "Story not found" });

    story.likes += 1;
    await story.save();
    res.status(200).json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error liking story", error: error.message });
  }
};
