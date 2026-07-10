import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Button, Box, CircularProgress, IconButton, LinearProgress } from "@mui/material";
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
  const { addToCart } = useCart(); // Pull in context action hook

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);
const { toggleWishlist, isInWishlist } = useWishlist();
  // Mock data for Customer Reviews UI
  const [reviews] = useState([
    { id: 1, name: "Arjun Sharma", rating: 5, date: "July 02, 2026", comment: "Absolutely love the quality! True to size and matches the pictures perfectly." },
    { id: 2, name: "Priya Patel", rating: 4, date: "June 28, 2026", comment: "Very comfortable material. The shipping took a day longer than expected, but product is worth it." },
    { id: 3, name: "Rohan Das", rating: 5, date: "June 15, 2026", comment: "Premium feel. Will definitely order from this collection again." }
  ]);

  const handleAddToCartClick = () => {
    if (!product) return;
    
    // Fire the contextual layout update dispatch hook
    addToCart(product, 1);
    toast.success(`${product.productName} added to cart!`);
  };

  useEffect(() => {
    const fetchFullProductData = async () => {
      if (!id || id === "undefined") return;
      
      try {
        setLoading(true);
        
        // 1. Fetch current product details
        const res = await api.get(`/products/${id}`);
        
        if (res.data.success) {
          // Extract the data from the response and set your main product state
          const productData = res.data.product || res.data.data;
          setProduct(productData);
          
          // Set the main image for the gallery
          if (productData?.images && productData.images.length > 0) {
            setMainImage(productData.images[0]);
          }

          // 2. Fetch similar products using a deep route to prevent parameter conflicts
          if (productData.item) {
            console.log(`Requesting recommendations for: ${productData.item}`);
            
            // Appending a deep nested namespace path eliminates wildcards matches
            const similarRes = await api.get(
              `/products/recommendations/similar?item=${encodeURIComponent(productData.item)}&excludeId=${productData._id}`
            );
            
            if (similarRes.data.success) {
              const extracted = similarRes.data.products || [];
              console.log("Successfully loaded recommendations:", extracted);
              setSimilarProducts(extracted);
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
            
            <div className="pdp-pricing-row">
              <span className="pdp-price">
                ₹ {product.price?.toLocaleString("en-IN")}
              </span>
              <span className="pdp-tax-info">Tax included.</span>
            </div>

            <hr className="pdp-divider" />

            {product.sizes && product.sizes.length > 0 && (
              <div className="pdp-attributes">
                <span className="pdp-attribute-label">Select Size</span>
                <div className="attribute-chips">
                  {product.sizes.map((size) => (
                    <span key={size} className="attr-chip">{size}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="pdp-action-buttons">
              <button 
                className="pdp-btn secondary"
                disabled={product.stockStatus === "Out Of Stock"}
                onClick={handleAddToCartClick}
              >
                Add to Cart
              </button>
              <button 
                className="pdp-btn primary"
                disabled={product.stockStatus === "Out Of Stock"}
              >
                Buy it Now
              </button>
            </div>

            {/* --- Connected PDP Wishlist Toggle Row --- */}
<div 
  className="pdp-wishlist-row" 
  onClick={() => toggleWishlist(product)} 
  style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
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
            {/* Left Box: Aggregated Data */}
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

            {/* Right Box: Individual Review Cards */}
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