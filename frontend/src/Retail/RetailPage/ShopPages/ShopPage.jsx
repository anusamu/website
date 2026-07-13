import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar"; 
import "./ShopPage.css";
import api from "../../../api"; 
import Footer from "../../../components/Footer/Footer";

const fallbackImages = [
  "https://i.postimg.cc/T3vt3jXP/MENS.jpg",
  "https://i.postimg.cc/KzjNHJtP/GIRL.jpg",
  "https://i.postimg.cc/qvrW5HqQ/PRO.jpg",
];

// Fallback collections defined here so they are globally accessible to the JSX template
const defaultCollections = [
  {
    _id: 'season1',
    name: 'Seasonal Collection',
    image: 'https://i.postimg.cc/mDBBs1mQ/5ce2e4af22c7273968630e1afa559d0f.jpg',
  },
  {
    _id: 'season2',
    name: 'Wedding Collection',
    image: 'https://i.postimg.cc/vm6tsc4F/photo-with-cousins-photo-in-saree-traditional.jpg',
  },
];

const ShopPage = () => {
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get("/attributes/form-options", { signal });
        const data = response.data;

        const rawCategories = Array.isArray(data) ? data : data.categories || [];
        const rawCollects = Array.isArray(data.collects) ? data.collects : [];

        // Dynamic lookup with structural defaults
        const seasonalCollect = rawCollects.find((item) => /season|festive/i.test(item.name)) || defaultCollections[0];
        const weddingCollect = rawCollects.find((item) => /wedding/i.test(item.name)) || defaultCollections[1];

        setCategories(rawCategories);
        setCollections([seasonalCollect, weddingCollect]);
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

  const handleCategoryClick = (categoryName) => {
    if (!categoryName) return;
    navigate(`/category-products?category=${encodeURIComponent(categoryName.trim())}`);
  };

  const handleCollectionClick = (collectionName) => {
    if (!collectionName) return;
    navigate(`/category-products?collection=${encodeURIComponent(collectionName.trim())}`);
  };

  const handleNewArrivalsClick = () => {
    navigate(`/category-products?filter=newest`);
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
            <p className="shop-status-text">Loading premium collections...</p>
          ) : error ? (
            <p className="shop-error-text">Error matching collections: {error}</p>
          ) : (
            <>
              <div className="category-grid standard-grid">
                {categories.slice(0, 2).map((cat, index) => {
                  const title = cat.name || cat.title || `Collection ${index + 1}`;
                  const displayImage = cat.image || cat.imageUrl || fallbackImages[index % fallbackImages.length];

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

              {categories.length > 2 && (
                <div className="category-grid single-centered-grid">
                  {categories.slice(2, 3).map((cat, index) => {
                    const actualIndex = index + 2; 
                    const title = cat.name || cat.title || `Collection ${actualIndex + 1}`;
                    const displayImage = cat.image || cat.imageUrl || fallbackImages[actualIndex % fallbackImages.length];

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
            <div className="category-card dynamic-banner-card" onClick={handleNewArrivalsClick}>
              <div className="image-wrapper large-banner">
                <img 
                  src="https://i.postimg.cc/d1jQkjhG/33ecab45094204489dcda36387be0ea0.jpg" 
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

        {/* SECTION 3: SEASONAL & WEDDING COLLECTIONS */}
        <section className="shop-section">
          <h2 className="section-title">Seasonal & Wedding Collections</h2>
          <p className="section-description">Pick a curated seasonal or wedding collection below to view the matching products.</p>
          <div className="category-grid standard-grid">
            {loading ? (
              <p className="shop-status-text">Loading collections...</p>
            ) : error ? (
              <p className="shop-error-text">Error matching collections: {error}</p>
            ) : (
              collections.map((collectItem, index) => {
                const title = collectItem.name || collectItem.title || `Collection ${index + 1}`;
                
                // Prioritize database image field, falling back precisely to corresponding default images array entry
                const fallbackTarget = defaultCollections[index % defaultCollections.length].image;
                const displayImage = collectItem.image || collectItem.imageUrl || fallbackTarget;

                return (
                  <div 
                    key={collectItem._id || index} 
                    className="category-card season-card" 
                    onClick={() => handleCollectionClick(title)}
                  >
                    <div className="image-wrapper">
                      <img src={displayImage} alt={title} loading="lazy" />
                    </div>
                    <div className="card-info alignment-patch">
                      <div>
                        <h3>{title}</h3>
                        <p className="card-subtitle">Curated products for every fine moment.</p>
                      </div>
                      <span className="shop-now-link">shop now &rarr;</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
      <Footer/>
    </>
  );
};

export default ShopPage;