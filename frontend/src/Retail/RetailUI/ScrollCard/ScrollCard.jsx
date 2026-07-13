import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../components/Context/CartContext';
import { toast } from 'react-toastify';
import './ScrollCard.css';
import api from '../../../api';

function ScrollCard() {
  const [allProducts, setAllProducts] = useState([]); 
  const [categories, setCategories] = useState([]);   
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
          if (productType && !uniqueTypeMap[productType]) {
            uniqueTypeMap[productType] = product;
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
    event.stopPropagation(); // Prevents layout link from routing to details page
    
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
      <div className="status-container">
        <p className="status-text">Loading collections from database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="status-container">
        <p className="status-text error">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="main-wrapper">
      {/* INFINITE SCROLLING TRAIL */}
      <div className="scroll-container">
        <div className="scroll-track">
          <div className="scroll-marquee">
            {categories.map((item, index) => (
              <CardItem 
                key={`main-${item._id || index}`} 
                item={item} 
                onClick={() => handleCategoryClick(item.type)} 
              />
            ))}
            {categories.map((item, index) => (
              <CardItem 
                key={`clone-${item._id || index}`} 
                item={item} 
                onClick={() => handleCategoryClick(item.type)} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* VARIANTS DRILL DOWN GRID AREA */}
      {selectedType && (
        <div className="variants-section" ref={variantsRef}>
          <div className="variants-header">
            <h2>Shop {selectedType}</h2>
            <p>Explore all beautifully crafted variants in this collection.</p>
          </div>
          
          {/* Changed standard grid layout container styling target */}
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

// Scroller item component
function CardItem({ item, onClick }) {
  const displayImage = item.images && item.images.length > 0 
    ? item.images[0] 
    : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400';

  return (
    <div className="card-item" onClick={onClick}>
      <div className="card-image-wrapper">
        <img src={displayImage} alt={item.type} className="card-img" loading="lazy" />
      </div>
      <h3 className="card-title">{item.type}</h3>
    </div>
  );
}

// PREMIUM UPGRADED VARIANT CARD COMPONENT
function VariantCard({ variant, onCardClick, onAddToCartClick }) {
  const displayImage = variant.images && variant.images.length > 0 
    ? variant.images[0] 
    : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600';

  const title = variant.productName || variant.type || "Borderless cloth item...";
  const price = `₹ ${variant.price}`;

  return (
    <div className="cat-product-display-card">
      {/* Interactive Image Frame */}
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
        
        {/* Animated Add to Cart Action strip overlay inside image footprint */}
        <button 
          className="cat-action-add-to-cart-btn"
          disabled={variant.stockStatus === "Out Of Stock"}
          onClick={(event) => onAddToCartClick(variant, event)}
        >
          {variant.stockStatus === "Out Of Stock" ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>

      {/* Typography Profile underneath Image container boundary */}
      <div className="cat-product-meta-details">
        <h3 className="cat-product-meta-title">{title}</h3>
        <p className="cat-product-meta-price">{price}</p>
      </div>
    </div>
  );
}

export default ScrollCard;