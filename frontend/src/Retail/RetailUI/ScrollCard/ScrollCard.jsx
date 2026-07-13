import React, { useEffect, useState, useRef } from 'react';
import './ScrollCard.css';
import api from '../../../api';

function ScrollCard() {
  const [allProducts, setAllProducts] = useState([]); 
  const [categories, setCategories] = useState([]);   
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const variantsRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchDatabaseData = async () => {
      try {
        setLoading(true);

        // Hits your getProducts controller
        const response = await api.get("/products", {
          signal,
        });

        // 1. Handle wrapped object (response.data.products) OR direct array (response.data)
        const rawData = response.data?.products || response.data;

        // 2. Safe fallback: Ensure it's absolutely an array before running loops
        const productsArray = Array.isArray(rawData) ? rawData : [];

        setAllProducts(productsArray);

        // Get one representative product for each unique type
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
        // Ignore request cancellation
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

  // Filters out variants matching the type chosen
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
          
          <div className="variants-grid">
            {displayedVariants.map((variant, index) => (
              <VariantCard key={variant._id || index} variant={variant} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Scroller item component - extracts array item index 0 safely
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

// Grid layout display item component
function VariantCard({ variant }) {
  const displayImage = variant.images && variant.images.length > 0 
    ? variant.images[0] 
    : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400';

  return (
    <div className="variant-card">
      <div className="variant-image-wrapper">
        <img src={displayImage} alt={variant.productName} className="variant-img" loading="lazy" />
      </div>
      <div className="variant-details">
        <h4 className="variant-name">{variant.productName || variant.type}</h4>
        <p className="variant-price">${variant.price}</p>
      </div>
    </div>
  );
}

export default ScrollCard;