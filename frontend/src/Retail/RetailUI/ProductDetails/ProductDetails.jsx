import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Button, Box, CircularProgress, IconButton, LinearProgress, Chip } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { toast } from "react-toastify";
import api from "../../../api";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import { useWishlist } from "../../../components/Context/WishlistContext";
import { useCart } from "../../../components/Context/CartContext";
import "./ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedSize, setSelectedSize] = useState('');
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);

  // Mock data for Customer Reviews UI
  const [reviews] = useState([
    { id: 1, name: "Arjun Sharma", rating: 5, date: "July 02, 2026", comment: "Absolutely love the quality! True to size and matches the pictures perfectly." },
    { id: 2, name: "Priya Patel", rating: 4, date: "June 28, 2026", comment: "Very comfortable material. The shipping took a day longer than expected, but product is worth it." },
    { id: 3, name: "Rohan Das", rating: 5, date: "June 15, 2026", comment: "Premium feel. Will definitely order from this collection again." }
  ]);

  // Safely normalizes sizes to array of strings (handles both object arrays and string arrays)
  const normalizeSizes = (sizes) => {
    if (!sizes) return [];
    
    if (Array.isArray(sizes)) {
      return sizes
        .map((s) => {
          if (typeof s === "object" && s !== null) {
            return s.size || ""; // Extracts size string if it's an object { size: 'M', quantity: 5 }
          }
          return String(s || "").trim();
        })
        .filter(Boolean);
    }

    if (typeof sizes === "string") {
      try {
        const parsed = JSON.parse(sizes);
        return normalizeSizes(parsed);
      } catch {
        return sizes.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const availableSizes = product ? normalizeSizes(product.sizes) : [];

  // Calculate total stock count directly from size objects or database field
  const getStockCount = () => {
    if (!product) return 0;

    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      return product.sizes.reduce((sum, item) => {
        if (typeof item === "object" && item !== null) {
          return sum + (Number(item.quantity) || 0);
        }
        return sum;
      }, 0);
    }

    return Number(product.stockCount) || 0;
  };

  const totalStock = getStockCount();
  const isOutOfStock = totalStock <= 0 || product?.status === "inactive";

  const handleAddToCartClick = () => {
    if (!product || isOutOfStock) return;

    if (availableSizes.length > 0 && !selectedSize) {
      toast.warning("Please select a size first.");
      return;
    }

    addToCart(product, 1, selectedSize);
    toast.success(`${product.productName} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!product || isOutOfStock) return;

    if (availableSizes.length > 0 && !selectedSize) { 
      toast.warning("Please select a size before proceeding to checkout."); 
      return; 
    }

    navigate('/checkout', { 
      state: { 
        checkoutItems: [{
          product: product,
          size: selectedSize || "OS",
          quantity: 1,
          price: product.price
        }],
        isDirectCheckout: true
      } 
    });
  };

  useEffect(() => {
    const fetchFullProductData = async () => {
      if (!id || id === "undefined") return;

      try {
        setLoading(true);

        const res = await api.get(`/products/${id}`);

        if (res.data.success) {
          const productData = res.data.product || res.data.data;
          setProduct(productData);

          if (productData?.images && productData.images.length > 0) {
            setMainImage(productData.images[0]);
          }

          if (productData.item) {
            const similarRes = await api.get(
              `/products/recommendations/similar?item=${encodeURIComponent(productData.item)}&excludeId=${productData._id}`
            );

            if (similarRes.data.success) {
              setSimilarProducts(similarRes.data.products || []);
            }
          }
        }
      } catch (error) {
        console.error("Error loading page details:", error);
        toast.error("Failed to load product page.");
      } finally {
        setLoading(false);
      }
    };

    fetchFullProductData();
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <Box className="pdp-status-container">
          <CircularProgress size={40} sx={{ color: "#111" }} />
        </Box>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <Box className="pdp-status-container">
          <Typography variant="h6" sx={{ fontWeight: 400, mb: 2 }}>Product not found.</Typography>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate(-1)}
            sx={{ color: "#111", borderColor: "#111" }}
          >
            Go Back
          </Button>
        </Box>
      </>
    );
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => 
      i < rating ? (
        <StarIcon key={i} sx={{ color: "#FFB400", fontSize: "1.1rem" }} />
      ) : (
        <StarBorderIcon key={i} sx={{ color: "#DDD", fontSize: "1.1rem" }} />
      )
    );
  };

  return (
    <>
      <Navbar />
      <div className="pdp-page-wrapper">
        <div className="pdp-container">

          {/* Left Column: Image Gallery */}
          <div className="pdp-image-section">
            <div className="pdp-main-image-wrapper">
              <img 
                src={mainImage || "/placeholder-image.jpg"} 
                alt={product.productName} 
                className="pdp-main-image" 
              />
            </div>

            {product.images && product.images.length > 1 && (
              <div className="pdp-thumbnail-list">
                {product.images.map((img, index) => (
                  <div 
                    key={index}
                    className={`pdp-thumbnail-container ${mainImage === img ? "active" : ""}`}
                    onClick={() => setMainImage(img)}
                  >
                    <img
                      src={img}
                      alt={`${product.productName} thumbnail ${index + 1}`}
                      className="pdp-thumbnail"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information Panel */}
          <div className="pdp-info-section">
            <span className="pdp-collection-tag">
              {product.collect || "Exclusive Collection"}
            </span>
            <h1 className="pdp-title">{product.productName}</h1>

            <div className="pdp-pricing-row" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span className="pdp-price">
                ₹ {product.price?.toLocaleString("en-IN")}
              </span>
              <span className="pdp-tax-info">Tax included.</span>

              {/* Dynamic Stock Status Chip */}
              {totalStock <= 0 ? (
                <Chip label="Out of Stock" color="error" size="small" variant="filled" />
              ) : totalStock <= 5 ? (
                <Chip label={`Few Left (${totalStock})`} color="warning" size="small" variant="filled" />
              ) : (
                <Chip label="Available" color="success" size="small" variant="filled" />
              )}
            </div>

            <hr className="pdp-divider" />

            {/* Available Sizes Selection */}
            {availableSizes.length > 0 && (
              <div className="pdp-attributes">
                <span className="pdp-attribute-label">Select Size</span>
                <div className="attribute-chips">
                  {availableSizes.map((size, index) => (
                    <span 
                      key={`${size}-${index}`} 
                      className={`attr-chip ${selectedSize === size ? "active-size" : ""}`}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        cursor: 'pointer',
                        padding: '8px 16px',
                        border: selectedSize === size ? '2px solid #111' : '1px solid #ccc',
                        fontWeight: selectedSize === size ? 'bold' : 'normal',
                        marginRight: '8px',
                        display: 'inline-block',
                        borderRadius: '4px'
                      }}
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pdp-action-buttons" style={{ marginTop: "20px" }}>
              <button 
                className="pdp-btn secondary"
                disabled={isOutOfStock}
                onClick={handleAddToCartClick}
                style={{ opacity: isOutOfStock ? 0.5 : 1, cursor: isOutOfStock ? "not-allowed" : "pointer" }}
              >
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </button>
              <button 
                className="pdp-btn primary"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                style={{ opacity: isOutOfStock ? 0.5 : 1, cursor: isOutOfStock ? "not-allowed" : "pointer" }}
              >
                Buy it Now
              </button>
            </div>

            {/* Wishlist Toggle Row */}
            <div 
              className="pdp-wishlist-row" 
              onClick={() => toggleWishlist(product)} 
              style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", marginTop: "16px" }}
            >
              <IconButton 
                size="small" 
                className="wishlist-btn"
                sx={{ 
                  transition: "transform 0.2s ease",
                  "&:hover": { transform: "scale(1.1)" }
                }}
              >
                {isInWishlist(product?._id || product?.id) ? (
                  <FavoriteIcon fontSize="small" sx={{ color: "#ff4d4d" }} />
                ) : (
                  <FavoriteBorderIcon fontSize="small" sx={{ color: "#666" }} />
                )}
              </IconButton>
              <span className="wishlist-text" style={{ fontSize: "0.95rem", color: "#222", userSelect: "none" }}>
                {isInWishlist(product?._id || product?.id) ? "Saved in Wishlist" : "Add to wishlist"}
              </span>
            </div>

            <div className="pdp-features">
              <div className="feature-item">
                <LocalShippingOutlinedIcon className="feature-icon" />
                <div>
                  <span className="feature-title">Free Shipping</span>
                  <span className="feature-desc">On orders exceeding ₹6,000 value.</span>
                </div>
              </div>
              <div className="feature-item">
                <PaymentsOutlinedIcon className="feature-icon" />
                <div>
                  <span className="feature-title">Payment Options</span>
                  <span className="feature-desc">Cash on Delivery accepted here.</span>
                </div>
              </div>
            </div>

            {product.description && (
              <div className="pdp-description-section">
                <span className="pdp-description-label">Overview Description</span>
                <p className="pdp-description-text">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Similar Items Section */}
        {similarProducts && similarProducts.length > 0 && (
          <div className="pdp-similar-section">
            <div className="pdp-similar-header">
              <h2 className="pdp-similar-heading">You May Also Like</h2>
              <div className="pdp-similar-line" />
            </div>

            <div className="pdp-similar-grid">
              {similarProducts.slice(0, 4).map((item) => (
                <div 
                  key={item._id} 
                  className="pdp-similar-card"
                  onClick={() => navigate(`/product/${item._id}`)}
                >
                  <div className="pdp-similar-img-wrapper">
                    <img 
                      src={item.images?.[0] || "/placeholder-image.jpg"} 
                      alt={item.productName || "Similar Item"} 
                      className="pdp-similar-img"
                      loading="lazy"
                    />
                  </div>
                  <div className="pdp-similar-meta">
                    <span className="pdp-similar-title">{item.productName}</span>
                    <span className="pdp-similar-price">₹ {item.price?.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <hr className="pdp-section-divider" />

        {/* Customer Reviews UI Section */}
        <div className="pdp-reviews-section">
          <div className="pdp-reviews-header">
            <h2 className="pdp-reviews-heading">Customer Reviews</h2>
          </div>

          <div className="pdp-reviews-container">
            <div className="pdp-reviews-summary-card">
              <div className="summary-score-block">
                <span className="summary-average-num">4.7</span>
                <div className="summary-stars-row">{renderStars(5)}</div>
                <span className="summary-total-count">Based on {reviews.length} reviews</span>
              </div>

              <div className="summary-distribution-list">
                <div className="dist-row">
                  <span className="dist-label">5 star</span>
                  <Box sx={{ width: "100%", mx: 1 }}>
                    <LinearProgress variant="determinate" value={66} sx={{ height: 6, borderRadius: 3, bgcolor: "#F0F0F0", "& .MuiLinearProgress-bar": { bgcolor: "#FFB400" } }} />
                  </Box>
                  <span className="dist-percentage">66%</span>
                </div>
                <div className="dist-row">
                  <span className="dist-label">4 star</span>
                  <Box sx={{ width: "100%", mx: 1 }}>
                    <LinearProgress variant="determinate" value={34} sx={{ height: 6, borderRadius: 3, bgcolor: "#F0F0F0", "& .MuiLinearProgress-bar": { bgcolor: "#FFB400" } }} />
                  </Box>
                  <span className="dist-percentage">34%</span>
                </div>
                {[3, 2, 1].map((star) => (
                  <div className="dist-row" key={star}>
                    <span className="dist-label">{star} star</span>
                    <Box sx={{ width: "100%", mx: 1 }}>
                      <LinearProgress variant="determinate" value={0} sx={{ height: 6, borderRadius: 3, bgcolor: "#F0F0F0" }} />
                    </Box>
                    <span className="dist-percentage">0%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pdp-reviews-feed">
              {reviews.map((rev) => (
                <div className="review-feed-card" key={rev.id}>
                  <div className="review-card-top">
                    <div className="review-user-info">
                      <span className="review-username">{rev.name}</span>
                      <div className="review-stars">{renderStars(rev.rating)}</div>
                    </div>
                    <span className="review-date">{rev.date}</span>
                  </div>
                  <p className="review-comment">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
};

export default ProductDetails;