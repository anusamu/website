const Cart = require("../models/Cart");

// 1. Get or create user cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access." });
    }

    let cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    return res.status(200).json(cart);
  } catch (error) {
    console.error("getCart Error:", error);
    return res.status(500).json({ message: "Server error fetching cart", error: error.message });
  }
};

// 2. Add or Update Item Quantity (+1 / -1) in Cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access." });
    }

    let { productId, quantity, size } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required." });
    }

    // 🔴 FIX: If productId is passed as an object or object-wrapper, extract the raw string ID
    if (typeof productId === "object" && productId !== null) {
      productId = productId._id || productId.id || productId.productId;
    }

    // Ensure productId is a clean string trimmed of whitespace
    const cleanProductId = String(productId).trim();
    const itemSize = size ? String(size).trim() : "Standard";
    const qtyChange = Number(quantity) || 1;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Find index matching BOTH Product ID and exact Size
    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product &&
        item.product.toString() === cleanProductId &&
        (item.size || "Standard").trim() === itemSize
    );

    if (itemIndex > -1) {
      // Item variant exists: update quantity
      cart.items[itemIndex].quantity += qtyChange;

      if (cart.items[itemIndex].quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      }
    } else {
      // New item variant: push to cart
      if (qtyChange > 0) {
        cart.items.push({
          product: cleanProductId, // Uses the cleaned string ID
          size: itemSize,
          quantity: qtyChange,
        });
      }
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate("items.product");
    return res.status(200).json(updatedCart);
  } catch (error) {
    console.error("addToCart Error:", error);
    return res.status(500).json({ message: "Server error updating cart", error: error.message });
  }
};
// 3. Remove Item variant completely from Cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access." });
    }

    const { productId, size } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required." });
    }

    const itemSize = size ? String(size).trim() : "Standard";

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    // Filter out item matching BOTH product ID and size
    cart.items = cart.items.filter(
      (item) =>
        !(
          item.product.toString() === productId.toString() &&
          (item.size || "Standard").trim() === itemSize
        )
    );

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate("items.product");
    return res.status(200).json(updatedCart);
  } catch (error) {
    console.error("removeFromCart Error:", error);
    return res.status(500).json({ message: "Server error removing item", error: error.message });
  }
};