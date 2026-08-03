const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");

// User: Add a review for a product
exports.addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id || req.user.id; // From authMiddleware

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (product.reviewsEnabled === false) {
      return res.status(400).json({ success: false, message: "Reviews are disabled for this product." });
    }

    // Optional: Check if user already reviewed
    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: "You have already reviewed this product." });
    }

    const review = await Review.create({
      product: productId,
      user: userId,
      rating: Number(rating),
      comment
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Public: Get all reviews for a specific product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId, status: "approved" })
      .populate("user", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// User: Check if eligible to review
exports.checkEligibility = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id || req.user.id;

    // Check if user already reviewed
    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) {
      return res.status(200).json({ success: true, eligible: false, reason: "already_reviewed" });
    }

    // Check if user bought this product
    const order = await Order.findOne({
      userId: userId,
      "items.product": productId,
      // You can also add status check here if you only want 'Delivered' orders
    });

    if (!order) {
      return res.status(200).json({ success: true, eligible: false, reason: "not_purchased" });
    }

    res.status(200).json({ success: true, eligible: true });
  } catch (error) {
    console.error("Error checking eligibility:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all reviews (for all products)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "firstName lastName email")
      .populate("product", "productName images")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Edit a review
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    const review = await Review.findByIdAndUpdate(
      id,
      { status, comment },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.status(200).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Toggle reviewsEnabled for a product
exports.toggleProductReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewsEnabled } = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      { reviewsEnabled },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
