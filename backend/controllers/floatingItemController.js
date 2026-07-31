const FloatingItem = require("../models/FloatingItem");

// Get all active items for the Shop Page (Public)
exports.getActiveFloatingItems = async (req, res) => {
  try {
    const items = await FloatingItem.find({ isActive: true });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all items for Admin Dashboard
exports.getAllFloatingItems = async (req, res) => {
  try {
    const items = await FloatingItem.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new floating item (Admin)
exports.createFloatingItem = async (req, res) => {
  try {
    const { title, type, content, particleSymbol } = req.body;
    let finalContent = content;

    // Handle uploaded file if type is 'image' and file is present
    if (type === "image" && req.file) {
      finalContent = `/uploads/${req.file.filename}`;
    }

    const newItem = await FloatingItem.create({
      title,
      type,
      content: finalContent,
      particleSymbol: particleSymbol || "✨",
    });

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Toggle active status or delete item (Admin)
exports.toggleItemStatus = async (req, res) => {
  try {
    const item = await FloatingItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.isActive = !item.isActive;
    await item.save();
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteFloatingItem = async (req, res) => {
  try {
    await FloatingItem.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};