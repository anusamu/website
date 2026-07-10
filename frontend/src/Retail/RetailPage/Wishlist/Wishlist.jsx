import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Typography, Button, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useWishlist } from "../../../components/Context/WishlistContext"; 
import { useCart } from "../../../components/Context/CartContext";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import { toast } from "react-toastify";
import "./Wishlist.css";

const Wishlist = () => {
  const navigate = useNavigate();
  
  // Destructuring wishlist array reactively directly out of global app context
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (e, product) => {
    e.stopPropagation(); // Stops routing navigation down to the item Detail view panel
    
    // 1. Adds target item instances to context shopping cart store
    addToCart(product, 1);
    
    // 2. Clear item seamlessly from global active wishlist array tracker
    toggleWishlist(product); 
    
    toast.success(`Moved "${product.productName}" straight to your shopping bag!`);
  };

  return (
    <>
      <Navbar />
      <Box sx={{ minHeight: "80vh", pt: "120px", pb: "80px", px: { xs: 2, md: 6 }, maxWidth: "1400px", margin: "0 auto" }}>
        
        <Typography variant="h4" sx={{ fontWeight: 500, mb: 1, color: "#111", fontFamily: "inherit" }}>
          My Wishlist
        </Typography>
        <Typography variant="body2" sx={{ color: "#666", mb: 5 }}>
          {wishlist.length} {wishlist.length === 1 ? "item saved" : "items saved"}
        </Typography>

        {wishlist.length === 0 ? (
          /* Clean Minimalist Empty State Wrapper View Block */
          <Box sx={{ textAlign: "center", py: 10 }}>
            <FavoriteBorderIcon sx={{ fontSize: "3.5rem", color: "#ccc", mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
              Your wishlist is empty
            </Typography>
            <Typography variant="body2" sx={{ color: "#777", mb: 4 }}>
              Save items you like here to track availability and quickly move them to your cart.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate("/shop")}
              sx={{ bgcolor: "#111", color: "#fff", textTransform: "none", px: 4, py: 1, "&:hover": { bgcolor: "#222" } }}
            >
              Explore Products
            </Button>
          </Box>
        ) : (
          /* Live Reactive Shopping Grid View Layout Container */
          <Grid container spacing={3}>
            {wishlist.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item._id || item.id}>
                <div className="wishlist-product-card" onClick={() => navigate(`/product/${item._id || item.id}`)}>
                  
                  {/* Remove Button - Clicking this updates state instantly on screen */}
                  <IconButton 
                    className="wishlist-remove-icon-btn"
                    onClick={(e) => {
                      e.stopPropagation(); // Keeps page click isolated to action choice
                      toggleWishlist(item);
                    }}
                    sx={{ position: "absolute", top: 12, right: 12, bgcolor: "rgba(255,255,255,0.9)", zIndex: 5, "&:hover": { bgcolor: "#fff" } }}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" sx={{ color: "#555" }} />
                  </IconButton>

                  <div className="wishlist-img-frame">
                    <img 
                      src={item.images?.[0] || "/placeholder-image.jpg"} 
                      alt={item.productName} 
                    />
                  </div>

                  <div className="wishlist-meta-box">
                    <span className="wishlist-collection-lbl">{item.collect || "Exclusive"}</span>
                    <h3 className="wishlist-item-name">{item.productName}</h3>
                    <p className="wishlist-item-price">₹ {item.price?.toLocaleString("en-IN")}</p>
                    
                    <button 
                      className="wishlist-add-to-bag-btn"
                      disabled={item.stockStatus === "Out Of Stock"}
                      onClick={(e) => handleMoveToCart(e, item)}
                    >
                      <ShoppingBagOutlinedIcon sx={{ fontSize: "1.1rem", mr: 1 }} />
                      {item.stockStatus === "Out Of Stock" ? "Out of Stock" : "Add to Bag"}
                    </button>
                  </div>

                </div>
              </Grid>
            ))}
          </Grid>
        )}

      </Box>
      <Footer />
    </>
  );
};

export default Wishlist;