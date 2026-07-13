import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CategoryProducts.css";
import Navbar from "../../../components/Navbar/Navbar";
import api from "../../../api";
import { useCart } from "../../../components/Context/CartContext";
import { toast } from "react-toastify";
import Footer from "../../../components/Footer/Footer";

const CategoryProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Extract addToCart from your provider hook safely
  const { addToCart } = useCart();

  // Extract query parameters from URL string
  const queryParams = new URLSearchParams(location.search);
  const selectedCategory = queryParams.get("category");
  const selectedCollection = queryParams.get("collection");
  const filter = queryParams.get("filter");
  const searchQuery = queryParams.get("search");

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const queryParts = [];
        if (selectedCategory) queryParts.push(`category=${encodeURIComponent(selectedCategory.trim())}`);
        if (selectedCollection) queryParts.push(`collection=${encodeURIComponent(selectedCollection.trim())}`);
        if (filter) queryParts.push(`filter=${encodeURIComponent(filter.trim())}`);
        if (searchQuery) queryParts.push(`search=${encodeURIComponent(searchQuery.trim())}`);

        const queryString = queryParts.length ? `?${queryParts.join("&")}` : "";
        const res = await api.get(`/shop-products${queryString}`);
        const returned = res.data;
        const allProducts = Array.isArray(returned) ? returned : (returned.products || returned.data || []);

        setProducts(allProducts);
      } catch (err) {
        console.error("Error loading products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [selectedCategory, selectedCollection, filter, searchQuery]);

  // Click handler to go to detail page
  const handleCardClick = (productId) => {
    if (productId) {
      navigate(`/product/${productId}`);
    } else {
      console.warn("Product does not have a valid ID string.");
    }
  };

  // Click handler for Add to Cart button
  // Inside CategoryProducts.jsx:
const handleAddToCartClick = async (product, event) => {
  event.stopPropagation();
  
  const isLoggedIn = !!localStorage.getItem("token");
  if (!isLoggedIn) {
    toast.warn("Please log in to add items to your shopping cart!");
    return navigate("/login");
  }

  const success = await addToCart(product, 1);
  if (success) {
    toast.success(`${product.productName} added to cart!`);
  } else {
    toast.error("Failed to add item to cart. Try again.");
  }
};
  if (loading) {
    return (
      <div className="cat-grid-status-box">
        <p className="cat-status-message">Loading premium collections...</p>
      </div>
    );
  }

  const getHeaderTitle = () => {
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    if (filter === 'newest') return "Latest Arrivals";
    if (selectedCollection) return selectedCollection;
    if (selectedCategory) return selectedCategory;
    return "Our Entire Catalogue";
  };

  const getHeaderSubtitle = () => {
    if (searchQuery) return `Showing ${products.length} results for "${searchQuery}".`;
    if (filter === 'newest') return "Showing the latest 20 arrival products.";
    if (selectedCollection) return `Products from the ${selectedCollection} collection.`;
    if (selectedCategory) return `Products in the ${selectedCategory} category.`;
    return `Showing ${products.length} elegant items matching your selection.`;
  };

  return (
    <>
      <Navbar />
      <section className="cat-products-section">
        <div className="cat-ambient-bg-glow" />

        <div className="cat-products-container">
          
          <header className="cat-grid-header">
            <h1 className="cat-grid-title">{getHeaderTitle()}</h1>
            <p className="cat-grid-subtitle">
              {getHeaderSubtitle()}
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
                  <div 
                    key={product._id || index} 
                    className="cat-product-display-card"
                  >
                    {/* The image and button container */}
                    <div 
                      className="cat-product-image-container"
                      onClick={() => handleCardClick(product._id || product.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img 
                        src={displayImage} 
                        alt={title} 
                        className="cat-product-display-img" 
                        loading="lazy" 
                      />
                      
                      <button 
                        className="cat-action-add-to-cart-btn"
                        disabled={product.stockStatus === "Out Of Stock"}
                        onClick={(event) => handleAddToCartClick(product, event)} // Correct mapping pass configuration
                      >
                        {product.stockStatus === "Out Of Stock" ? "Out of Stock" : "Add to Cart"}
                      </button>
                    </div>

                    {/* Metadata summary layout below image */}
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
      <Footer/>
    </>
  );
};

export default CategoryProducts;