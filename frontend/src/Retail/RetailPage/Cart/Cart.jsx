import React from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Button, Box, IconButton, Divider } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { useCart } from "../../../components/Context/CartContext";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart } = useCart();

  const cartItems = cart?.items || [];

  // Price calculations
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + price * (item.quantity || 0);
  }, 0);

  const shippingThreshold = 699;
  const shippingFee = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 150;
  const totalAmount = subtotal + shippingFee;

  const handleQuantityIncrease = async (item) => {
    const productId = item.product._id || item.product;
    await addToCart(productId, 1, item.size);
  };

  const handleQuantityDecrease = async (item) => {
    const productId = item.product._id || item.product;
    if (item.quantity > 1) {
      await addToCart(productId, -1, item.size);
    } else {
      handleRemoveItem(item);
    }
  };

 const handleRemoveItem = async (item) => {
    const productId = item.product._id || item.product;
    await removeFromCart(productId, item.size);
    toast.info(`${item.product?.productName || "Item"} (${item.size}) removed from cart.`);
  };

  const handleCheckout = () => {
    navigate("/checkout", {
      state: { checkoutItems: cartItems },
    });
  };

  // Render empty state
  if (cartItems.length === 0) {
    return (
      <>
        <ToastContainer position="top-right" autoClose={3000} className="custom-toast-container" />
        <Navbar />
        <Box className="cart-navbar-spacer" />
        <Box className="cart-empty-container">
          <ShoppingBagOutlinedIcon sx={{ fontSize: "4.5rem", color: "#bbb", mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: "#111", letterSpacing: "-0.5px" }}>
            Your Bag is Empty
          </Typography>
          <Typography variant="body1" sx={{ color: "#666", mb: 4, maxWidth: 360, lineHeight: 1.6 }}>
            Looks like you haven't added any products to your cart yet. Let's find something beautiful.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/")}
            sx={{
              bgcolor: "#111",
              color: "#fff",
              padding: "14px 40px",
              borderRadius: "0px",
              fontWeight: 500,
              fontSize: "1rem",
              boxShadow: "none",
              "&:hover": { bgcolor: "#333", boxShadow: "none" },
            }}
          >
            Continue Shopping
          </Button>
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} className="custom-toast-container" />
      <Navbar />
      <div className="cart-navbar-spacer" />

      <div className="cart-page-wrapper">
        <div className="cart-container">
          {/* Left Side: Items List */}
          <div className="cart-items-section">
            <div className="cart-header-row">
              <div className="cart-heading-group">
                <h1 className="cart-page-title">Shopping Bag ({cartItems.length})</h1>
                <span className="cart-heading-separator">/</span>
                <button className="cart-wishlist-link-btn" onClick={() => navigate("/wishlist")}>
                  <FavoriteBorderIcon sx={{ fontSize: 16, mr: 0.5 }} /> Wishlist
                </button>
              </div>
              <Button
                startIcon={<ArrowBackIcon sx={{ fontSize: "16px !important" }} />}
                onClick={() => navigate(-1)}
                sx={{ color: "#767676", textTransform: "none", fontSize: "0.95rem", "&:hover": { color: "#111" } }}
              >
                Back
              </Button>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item) => {
                const product = item.product;
                if (!product) return null;

                const productId = product._id || product;
                const uniqueCardKey = `${productId}_${item.size}`;

                return (
                  <div key={uniqueCardKey} className="cart-item-card">
                    <div
                      className="cart-item-img-wrapper"
                      onClick={() => navigate(`/product/${productId}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <img
                        src={product.images?.[0] || "/placeholder-image.jpg"}
                        alt={product.productName}
                        className="cart-item-img"
                      />
                    </div>

                    <div className="cart-item-details">
                      <div className="cart-item-meta">
                        <div className="cart-item-title-row">
                          <h3
                            className="cart-item-name"
                            onClick={() => navigate(`/product/${productId}`)}
                            style={{ cursor: "pointer" }}
                          >
                            {product.productName}
                          </h3>
                          <IconButton
                            className="cart-item-delete-btn"
                            size="small"
                            onClick={() => handleRemoveItem(item)}
                            sx={{ color: "#aaa", "&:hover": { color: "#ff4d4d" }, transition: "color 0.2s ease" }}
                          >
                            <DeleteIcon fontSize="medium" />
                          </IconButton>
                        </div>
                        <span className="cart-item-collection">{product.collect || "Exclusive Item"}</span>

                        <div className="cart-item-size-badge" style={{ marginTop: "6px" }}>
                          <span style={{ fontSize: "0.875rem", color: "#444" }}>
                            Size: <strong style={{ color: "#111" }}>{item.size || "Standard"}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="cart-item-actions-row">
                        <div className="cart-qty-selector">
                          <button className="qty-btn" onClick={() => handleQuantityDecrease(item)}>
                            <RemoveIcon sx={{ fontSize: 14 }} />
                          </button>
                          <span className="cart-qty-num">{item.quantity}</span>
                          <button className="qty-btn" onClick={() => handleQuantityIncrease(item)}>
                            <AddIcon sx={{ fontSize: 14 }} />
                          </button>
                        </div>

                        <span className="cart-item-price">
                          ₹ {((product.price || 0) * (item.quantity || 0)).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Order Summary Panel */}
          <div className="cart-summary-section">
            <h2 className="summary-title">Order Summary</h2>
            <Divider sx={{ mb: 3, borderColor: "#eee" }} />

            <div className="summary-row">
              <span className="summary-label">Subtotal</span>
              <span className="summary-value">₹ {subtotal.toLocaleString("en-IN")}</span>
            </div>

            <div className="summary-row">
              <span className="summary-label">Estimated Shipping</span>
              <span className="summary-value">
                {shippingFee === 0 ? <span className="free-shipping-tag">FREE</span> : `₹ ${shippingFee}`}
              </span>
            </div>

            {shippingFee > 0 && (
              <p className="shipping-hint-text">
                Add <b>₹ {(shippingThreshold - subtotal).toLocaleString("en-IN")}</b> more to unlock Free Shipping!
              </p>
            )}

            <Divider sx={{ my: 3, borderColor: "#eee" }} />

            <div className="summary-row total">
              <span className="summary-total-label">Total Amount</span>
              <span className="summary-total-value">₹ {totalAmount.toLocaleString("en-IN")}</span>
            </div>

            <button className="cart-checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout
            </button>

            <button className="cart-continue-shopping-btn" onClick={() => navigate("/")}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart;