const Cart = require("../models/Cart"); // Path to your schema

// 1. Get or create user cart (and populate product details)
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching cart", error: error.message });
  }
};

// 2. Add or Update Item Quantity in Cart
exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      // If product exists, increment or set its quantity
      cart.items[itemIndex].quantity += Number(quantity || 1);
    } else {
      // If product does not exist, push item to array
      cart.items.push({ product: productId, quantity: Number(quantity || 1) });
    }

    await cart.save();
    // Return fully populated cart so frontend knows product details instantly
    const populatedCart = await cart.populate("items.product");
    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: "Server error adding to cart", error: error.message });
  }
};

// 3. Remove Item completely from Cart
exports.removeFromCart = async (req, res) => {
  const { productId } = req.params;
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();

    const populatedCart = await cart.populate("items.product");
    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: "Server error removing from cart", error: error.message });
  }
};