const Wishlist = require("../models/Wishlist");

// 1. Get user wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access." });
    }

    let wishlist = await Wishlist.findOne({ user: userId }).populate("items");
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [] });
    }

    return res.status(200).json(wishlist);
  } catch (error) {
    console.error("getWishlist Error:", error);
    return res.status(500).json({ message: "Server error fetching wishlist", error: error.message });
  }
};

// 2. Add Item to Wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access." });
    }

    let { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required." });
    }

    if (typeof productId === "object" && productId !== null) {
      productId = productId._id || productId.id || productId.productId;
    }

    const cleanProductId = String(productId).trim();

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, items: [] });
    }

    // Check if item already exists
    const itemExists = wishlist.items.some(
      (item) => item && item.toString() === cleanProductId
    );

    if (!itemExists) {
      wishlist.items.push(cleanProductId);
      await wishlist.save();
    }

    const updatedWishlist = await Wishlist.findById(wishlist._id).populate("items");
    return res.status(200).json(updatedWishlist);
  } catch (error) {
    console.error("addToWishlist Error:", error);
    return res.status(500).json({ message: "Server error updating wishlist", error: error.message });
  }
};

// 3. Remove Item from Wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access." });
    }

    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required." });
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found." });
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.toString() !== productId.toString()
    );

    await wishlist.save();

    const updatedWishlist = await Wishlist.findById(wishlist._id).populate("items");
    return res.status(200).json(updatedWishlist);
  } catch (error) {
    console.error("removeFromWishlist Error:", error);
    return res.status(500).json({ message: "Server error removing item from wishlist", error: error.message });
  }
};
