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
import { toast, ToastContainer } from "react-toastify"; // Added ToastContainer for local styling override
import "react-toastify/dist/ReactToastify.css";
import "./Cart.css";

const Cart = () => {
  const navigate = useNavigate();
  
  // Destructure variables matching your new backend-integrated CartContext
  const { cart, addToCart, removeFromCart } = useCart();
  
  // Extract items array safely based on database structural schema
  const cartItems = cart?.items || [];

  // Dynamic calculations unpacking item.product nested fields
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + price * (item.quantity || 0);
  }, 0);

  const shippingThreshold = 699;
  const shippingFee = subtotal > shippingThreshold || subtotal === 0 ? 0 : 150; 
  const totalAmount = subtotal + shippingFee;

  // Increment item quantity by 1 on the backend
  const handleQuantityIncrease = async (item) => {
    if (!item.product) return;
    await addToCart(item.product, 1);
  };

  // Decrement item quantity by 1, or completely remove if quantity drops to 1
  const handleQuantityDecrease = async (item) => {
    if (!item.product) return;
    if (item.quantity > 1) {
      await addToCart(item.product, -1);
    } else {
      handleRemoveItem(item);
    }
  };

  // Completely delete the unique product from the user's backend document array
  const handleRemoveItem = async (item) => {
    const targetId = item.product?._id || item.product?.id;
    
    if (!targetId) {
      console.error("No valid unique product ID found on nested item structure.", item);
      return;
    }

    await removeFromCart(targetId);
    toast.info(`${item.product?.productName || "Item"} removed from cart.`);
  };

  const handleCheckout = () => {
    toast.success("Proceeding to secure checkout gateway...");
  };

  // Render empty state view if no items exist inside the database array
  if (cartItems.length === 0) {
    return (
      <>
        {/* Customized Notification Container positioned and lowered */}
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
              textTransform: "none",
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
      {/* Customized Notification Container positioned and lowered */}
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
              {cartItems.map((item, index) => {
                const product = item.product;
                if (!product) return null; 

                const productId = product._id || product.id;

                return (
                  <div key={productId || index} className="cart-item-card">
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
                        <span className="cart-item-size">Size: Standard</span>
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

            <p className="tax-disclaimer">Taxes and shipping discounts applied at completion step.</p>

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