import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ShopByCategory.css";
import api from "../../../api";

// Fallback images
const fallbackImages = [
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=600",
];

function ShopByCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

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

        setCategories(rawCategories.slice(0, 3));
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

  // Handler mapping target collection parameters to search query views
  const handleCategoryClick = (categoryName) => {
    if (!categoryName) return;

    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  if (loading) {
    return (
      <div className="category-status-container">
        <p className="category-status-text">
          Loading premium collections...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-status-container">
        <p className="category-status-text error">
          Error matching categories: {error}
        </p>
      </div>
    );
  }

  return (
    <section className="category-section">
      <div className="category-container">
        <header className="category-header">
          <p className="sub-tagline">
            Rooted in tradition, designed for every celebration.
          </p>
          <h2 className="main-title">Shop by Category</h2>
        </header>

        <div className="category-grid">
        

          {categories.map((cat, index) => {
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
                style={{ cursor: "pointer" }}
              >
                <div className="image-frame">
                  <img src={displayImage} alt={title} loading="lazy" />
                </div>

                <h3 className="card-label">{title}</h3>
              </div>
            );
          })}
        </div>

        <div className="cta-wrapper">
          <button
            className="shop-now-btn"
            onClick={() => navigate("/products")}
          >
            Shop All
          </button>
        </div>
      </div>
    </section>
  );
}

export default ShopByCategory;