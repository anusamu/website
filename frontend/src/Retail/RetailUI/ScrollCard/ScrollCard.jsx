import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowUpRight, Compass } from 'lucide-react';
import { useCart } from '../../../components/Context/CartContext';
import { toast } from 'react-toastify';
import api from '../../../api';
import './ScrollCard.css';

function ScrollCard() {
  const [allProducts, setAllProducts] = useState([]); 
  const [categories, setCategories] = useState([]);   
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const variantsRef = useRef(null);
  
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchDatabaseData = async () => {
      try {
        setLoading(true);

        const response = await api.get("/products", {
          signal,
        });

        const rawData = response.data?.products || response.data;
        const productsArray = Array.isArray(rawData) ? rawData : [];
        setAllProducts(productsArray);

        const uniqueTypeMap = {};
        productsArray.forEach((product) => {
          const productType = product.type?.trim();
          if (productType) {
            if (!uniqueTypeMap[productType]) {
              uniqueTypeMap[productType] = {
                ...product,
                itemCount: 1
              };
            } else {
              uniqueTypeMap[productType].itemCount += 1;
            }
          }
        });

        setCategories(Object.values(uniqueTypeMap));
        setError(null);
      } catch (err) {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          console.error("Database fetch error:", err);
          setError(err.response?.data?.message || err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDatabaseData();

    return () => {
      controller.abort();
    };
  }, []);

  const handleCategoryClick = (type) => {
    setSelectedType(type);
    setTimeout(() => {
      variantsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCardClick = (productId) => {
    if (productId) {
      navigate(`/product/${productId}`);
    } else {
      console.warn("Product does not have a valid ID string.");
    }
  };

  const handleAddToCartClick = async (product, event) => {
    event.stopPropagation();
    
    const isLoggedIn = !!localStorage.getItem("token");
    if (!isLoggedIn) {
      toast.warn("Please log in to add items to your shopping cart!");
      return navigate("/login");
    }

    const success = await addToCart(product, 1);
    if (success) {
      toast.success(`${product.productName || 'Item'} added to cart!`);
    } else {
      toast.error("Failed to add item to cart. Try again.");
    }
  };

  const displayedVariants = selectedType 
    ? allProducts.filter(product => product.type?.trim() === selectedType.trim())
    : [];

  if (loading) {
    return (
      <div className="scroll-card-loader-container">
        <div className="scroll-card-spinner" />
        <p className="scroll-card-loader-text">Loading collections from database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="scroll-card-error-container">
        <p className="scroll-card-error-text">Error: {error}</p>
      </div>
    );
  }

  // Marquee looping items
  const marqueeItems = [...categories, ...categories, ...categories];

  return (
    <div className="main-wrapper">
      {/* REDESIGNED LIGHT SANDALWOOD HERO MARQUEE SECTION */}
      <section className="scroll-card-section">
        {/* Soft Sandalwood Backdrop Orbs */}
        <div className="scroll-card-backdrop">
          <div className="glow-orb glow-orb-primary" />
          <div className="glow-orb glow-orb-secondary" />
        </div>

        {/* Header */}
        <div className="scroll-card-header">
          <div>
          
            <h2 className="scroll-card-title">
              Explore <span className="scroll-card-title-highlight">Collections</span>
            </h2>
          </div>

      </div>
        <div 
          className="scroll-card-marquee-stage"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <motion.div
            className="scroll-card-marquee-track"
            animate={{
              x: isPaused ? undefined : ['0%', '-33.333%']
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: 'loop',
                duration: Math.max(categories.length * 8, 25),
                ease: 'linear'
              }
            }}
          >
            {marqueeItems.map((item, index) => (
              <CardItem 
                key={`item-${item._id || item.type}-${index}`} 
                item={item} 
                onClick={() => handleCategoryClick(item.type)} 
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* VARIANTS DRILL DOWN GRID AREA (ORIGINAL UNCHANGED) */}
      {selectedType && (
        <div className="variants-section" ref={variantsRef}>
          <div className="variants-header">
            <h2>Shop {selectedType}</h2>
            <p>Explore all beautifully crafted variants in this collection.</p>
          </div>
          
          <div className="cat-products-layout-grid">
            {displayedVariants.map((variant, index) => (
              <VariantCard 
                key={variant._id || index} 
                variant={variant} 
                onCardClick={handleCardClick}
                onAddToCartClick={handleAddToCartClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// REDESIGNED SCROLLER CARD ITEM (Upward & Forward lift, no side tilt)
function CardItem({ item, onClick }) {
  const displayImage = item.images && item.images.length > 0 
    ? item.images[0] 
    : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600';

  return (
    <motion.div 
      className="scroll-card-3d-item group" 
      onClick={onClick}
      whileHover={{ y: -12, scale: 1.02 }}
      whileTap={{ y: -6, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <div className="scroll-card-img-wrapper">
        <img src={displayImage} alt={item.type} className="scroll-card-img" loading="lazy" />
        <div className="scroll-card-img-overlay" />
      </div>

      {/* Direct Action Icon */}
   

      {/* Card Details Overlay */}
      <div className="scroll-card-details">
    
        <h3 className="scroll-card-item-title">{item.type}</h3>
        <p className="scroll-card-item-subtext">Tap to explore collection</p>
      </div>

      <div className="scroll-card-border-glow" />
    </motion.div>
  );
}

// PREMIUM UPGRADED VARIANT CARD COMPONENT (ORIGINAL UNCHANGED)
function VariantCard({ variant, onCardClick, onAddToCartClick }) {
  const displayImage = variant.images && variant.images.length > 0 
    ? variant.images[0] 
    : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600';

  const title = variant.productName || variant.type || "Borderless cloth item...";
  const price = `₹ ${variant.price}`;

  return (
    <div className="cat-product-display-card">
      <div 
        className="cat-product-image-container"
        onClick={() => onCardClick(variant._id || variant.id)}
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
          disabled={variant.stockStatus === "Out Of Stock"}
          onClick={(event) => onAddToCartClick(variant, event)}
        >
          {variant.stockStatus === "Out Of Stock" ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>

      <div className="cat-product-meta-details">
        <h3 className="cat-product-meta-title">{title}</h3>
        <p className="cat-product-meta-price">{price}</p>
      </div>
    </div>
  );
}

export default ScrollCard;