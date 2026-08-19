import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./ShopByCategory.css";
import api from "../../api";

// Fallback images
const fallbackImages = [
  "https://i.postimg.cc/k4bj9htq/0b226ffd6270af58d170233b8255ab66.jpg",
  "https://i.postimg.cc/jS24tkp5/3bd80b1ad07dcf1d29b127a172f817de.jpg",
  "https://i.postimg.cc/nrx1xVJq/1-966d4ce6-7e82-4725-b234-fcf81d6f867f.webp",
];

// Staggered container animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

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

  const handleCategoryClick = (categoryName) => {
    if (!categoryName) return;

    navigate(`/category-products?category=${encodeURIComponent(categoryName.trim())}`);
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
        <motion.header 
          className="category-header"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="sub-tagline">
            Rooted in tradition, designed for every celebration.
          </p>
          <h2 className="main-title">Shop by Category</h2>
        </motion.header>

        <motion.div 
          className="category-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {categories.map((cat, index) => {
            const title = cat.name || cat.title || `Collection ${index + 1}`;

            const displayImage =
              cat.image ||
              cat.imageUrl ||
              fallbackImages[index % fallbackImages.length];

            return (
              <motion.div
                variants={itemVariants}
                key={cat._id || index}
                className="category-card"
                onClick={() => handleCategoryClick(title)}
                whileHover={{ scale: 1.05, rotateX: 5, rotateY: -5, zIndex: 10 }}
                whileTap={{ scale: 0.95 }}
                style={{ cursor: "pointer", transformStyle: "preserve-3d" }}
              >
                <div className="image-frame" style={{ transform: "translateZ(20px)" }}>
                  <img src={displayImage} alt={title} loading="lazy" />
                </div>

                <h3 className="card-label" style={{ transform: "translateZ(30px)" }}>{title}</h3>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div 
          className="cta-wrapper"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <motion.button
            className="shop-now-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/category-products")}
          >
            Shop All
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

export default ShopByCategory;
