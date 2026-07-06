import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./CategoryProducts.css";
import Navbar from "../../../components/Navbar/Navbar";
import api from "../../../api";

const CategoryProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();

  // Extract query parameters from URL string
  const queryParams = new URLSearchParams(location.search);
  const selectedCategory = queryParams.get("category");
  const searchQuery = queryParams.get("search"); // Read search parameter sent by Navbar

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch data from backend database
        const res = await api.get("/products");
        const allProducts = res.data || [];

        let filtered = allProducts;

        // 1. FILTER BY CATEGORY (If coming via category click)
        if (selectedCategory) {
          const cleanSearchCategory = selectedCategory.trim().toLowerCase();
          
          filtered = filtered.filter((product) => {
            if (!product) return false;
            const productCat = typeof product.category === "object" 
              ? (product.category.name || product.category.title) 
              : (product.category || product.categoryName);
              
            return productCat?.toString().trim().toLowerCase() === cleanSearchCategory;
          });
        }

        // 2. FILTER BY SEARCH TERM (If user typed into the Navbar search bar)
        if (searchQuery) {
          const term = searchQuery.trim().toLowerCase();

          filtered = filtered.filter((product) => {
            if (!product) return false;

            // Safe checks for variant, type, pattern, name, and category fields
            const name = product.productName?.toLowerCase() || "";
            const type = product.type?.toLowerCase() || "";
            const variant = product.variant?.toLowerCase() || "";
            const pattern = product.pattern?.toLowerCase() || "";
            
            const categoryName = typeof product.category === "object"
              ? (product.category.name || product.category.title || "")
              : (product.category || product.categoryName || "");

            // Returns true if search term matches ANY metadata field
            return (
              name.includes(term) ||
              type.includes(term) ||
              variant.includes(term) ||
              pattern.includes(term) ||
              categoryName.toLowerCase().includes(term)
            );
          });
        }
        
        setProducts(filtered);
      } catch (err) {
        console.error("Error loading products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [selectedCategory, searchQuery]); // Re-runs cleanly when either category or search term changes

  const handleAddToCart = (id, event) => {
    event.stopPropagation(); 
    console.log(`Adding product ID ${id} to cart`);
  };

  if (loading) {
    return (
      <div className="cat-grid-status-box">
        <p className="cat-status-message">Loading premium collections...</p>
      </div>
    );
  }

  // Dynamic Page Title
  const getHeaderTitle = () => {
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    if (selectedCategory) return `${selectedCategory}`;
    return "Our Entire Catalogue";
  };

  return (
    <>
    <Navbar/>
    <section className="cat-products-section">
      <div className="cat-ambient-bg-glow" />

      <div className="cat-products-container">
        
        <header className="cat-grid-header">
          <h1 className="cat-grid-title">{getHeaderTitle()}</h1>
          <p className="cat-grid-subtitle">
            Showing {products.length} elegant items matching your selection.
          </p>
        </header>

        {error && (
          <p className="cat-error-message">{error}</p>
        )}

        {products.length > 0 ? (
          <div className="cat-products-layout-grid">
            {products.map((product, index) => {
              const displayImage = product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600';
              const title = product.productName || "Borderless cloth item...";
              const price = `₹ ${product.price}`;

              return (
                <div key={product._id || index} className="cat-product-display-card">
                  
                  <div className="cat-product-image-container">
                    <img 
                      src={displayImage} 
                      alt={title} 
                      className="cat-product-display-img" 
                      loading="lazy" 
                    />
                    
                    <button 
                      className="cat-action-add-to-cart-btn"
                      onClick={(e) => handleAddToCart(product._id || index, e)}
                    >
                      Add to Cart
                    </button>
                  </div>

                  <div className="cat-product-meta-details">
                    <h3 className="cat-product-meta-title">{title}</h3>
                    <p className="cat-product-meta-price">{price}</p>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="cat-empty-state-box">
            <p className="cat-empty-text">No products found matching your description.</p>
          </div>
        )}
      </div>
    </section>
    </>
  );
};

export default CategoryProducts;