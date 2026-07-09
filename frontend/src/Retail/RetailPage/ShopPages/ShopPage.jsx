import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar"; 
import "./ShopPage.css";
import api from "../../../api"; 

// Fallback images matching backend parsing indexes
const fallbackImages = [
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=600",
];

const ShopPage = () => {
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
   const [material, setMaterial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchCategories = async () => {
      try {
        setLoading(true);

        const response = await api.get("/attributes/form-options", {
          signal,
        });

        const data = response.data;

        // Safely parse out the categories array
        const rawCategories = Array.isArray(data)
          ? data
          : data.categories || [];

        setCategories(rawCategories);
        setError(null);
      } catch (err) {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          console.error("Category database fetch error:", err);
          setError(err.response?.data?.message || err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();

    return () => {
      controller.abort();
    };
  }, []);

  // Helper function to navigate to your CategoryProducts route
  const handleCategoryClick = (categoryName) => {
    if (!categoryName) return;

    navigate(`/category-products?category=${encodeURIComponent(categoryName.trim())}`);
  };

  return (
    <>
      <Navbar />
      <div className="shop-page-container">
        <header className="shop-header">
          <p className="shop-tagline">Rooted in tradition, designed for every celebration.</p>
          <h1 className="shop-main-title">Shop by Category</h1>
        </header>

        {/* SECTION 1: FEATURED COLLECTIONS */}
        <section className="shop-section">
          <h2 className="section-title">Featured Collections</h2>
          
          {loading ? (
            <p>Loading premium collections...</p>
          ) : error ? (
            <p>Error matching collections: {error}</p>
          ) : (
            <>
              {/* Grid for the first 2 categories */}
              <div className="category-grid standard-grid">
                {categories.slice(0, 2).map((cat, index) => {
                  const title = cat.name || cat.title || `Collection ${index + 1}`;
                  const displayImage =
                    cat.image ||
                    cat.imageUrl ||
                    fallbackImages[index % fallbackImages.length];

                  return (
                    <div 
                      key={cat._id || index} 
                      className="category-card" 
                      onClick={() => handleCategoryClick(title)}
                    >
                      <div className="image-wrapper">
                        <img src={displayImage} alt={title} loading="lazy" />
                      </div>
                      <div className="card-info">
                        <h3>{title}</h3>
                        <span className="shop-now-link">shop now &rarr;</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Centered Grid for the 3rd category if it exists */}
              {categories.length > 2 && (
                <div className="category-grid single-centered-grid">
                  {categories.slice(2, 3).map((cat, index) => {
                    const actualIndex = index + 2; 
                    const title = cat.name || cat.title || `Collection ${actualIndex + 1}`;
                    const displayImage =
                      cat.image ||
                      cat.imageUrl ||
                      fallbackImages[actualIndex % fallbackImages.length];

                    return (
                      <div 
                        key={cat._id || actualIndex} 
                        className="category-card" 
                        onClick={() => handleCategoryClick(title)}
                      >
                        <div className="image-wrapper">
                          <img src={displayImage} alt={title} loading="lazy" />
                        </div>
                        <div className="card-info">
                          <h3>{title}</h3>
                          <span className="shop-now-link">shop now &rarr;</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>

        {/* SECTION 2: NEW ARRIVALS */}
        <section className="shop-section">
          <h2 className="section-title">New arrivals</h2>
          <div className="category-grid full-width-grid">
            <div className="category-card dynamic-banner-card" onClick={() => handleCategoryClick("New arrivals")}>
              <div className="image-wrapper large-banner">
                <img 
                  src="https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=1200" 
                  alt="New arrivals" 
                  loading="lazy"
                />
              </div>
              <div className="card-info">
                <h3>Discover What's New</h3>
                <span className="shop-now-link">shop now &rarr;</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: SEASON COLLECTION */}
        <section className="shop-section">
          <h2 className="section-title">Season collection</h2>
          <div className="category-grid standard-grid">
            {loading ? (
              <p>Loading premium collections...</p>
            ) : error ? (
              <p>Error matching collections: {error}</p>
            ) : (
              material.map((cat, index) => {
                const title = cat.name || cat.title || `collections ${index + 1}`;
                const displayImage =
                  cat.image ||
                  cat.imageUrl ||
                  fallbackImages[index % fallbackImages.length];

                return (
                  <div 
                    key={cat._id || index} 
                    className="category-card" 
                    onClick={() => handleCategoryClick(title)}
                  >
                    <div className="image-wrapper">
                      <img 
                        src={displayImage} 
                        alt={title} 
                        loading="lazy"
                      />
                    </div>
                    <div className="card-info">
                      <h3>{title}</h3>
                      <span className="shop-now-link">shop now &rarr;</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default ShopPage;