import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ShopByPattern.css";
import api from "../../../api";

// Extracted FeaturesBar into its own component block for cleaner tracking
function FeaturesBar() {
  return (
    <div className="features-bar-container">
      <div className="features-inner-wrapper">
        {[
          { icon: <path d="M5 18h14M5 14h14M14 6l3 3v5M3 9h11v5H3V9z" />, dots: true, title: "Free Shipping", desc: "On orders above ₹1999" },
          { icon: <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l.73-1.19" />, title: "Easy Returns", desc: "Within 7 Days" },
          { icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, title: "Premium Quality", desc: "Finest Fabrics" },
          { icon: <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />, poly: true, title: "Secure Payments", desc: "100% Secure checkout" },
          { icon: <path d="M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3" />, title: "24/7 Support", desc: "We're here to help" }
        ].map((feat, index) => (
          <div className="feature-item" key={index}>
            <div className="feature-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {feat.icon}
                {feat.dots && (
                  <>
                    <circle cx="6.5" cy="16.5" r="1.5"/>
                    <circle cx="14.5" cy="16.5" r="1.5"/>
                  </>
                )}
                {feat.poly && <polyline points="22 4 12 14.01 9 11.01" />}
              </svg>
            </div>
            <div className="feature-text-content">
              <h4 className="feature-title">{feat.title}</h4>
              <p className="feature-desc">{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShopByPattern() {
  const navigate = useNavigate();
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [centerIndex, setCenterIndex] = useState(0);
  
  // Touch coordinates tracking state hooks for smooth mobile swiping
  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchPatterns = async () => {
      try {
        setLoading(true);
        const response = await api.get("/products", { signal });
        const rawData = response.data?.products || response.data;
        const productsArray = Array.isArray(rawData) ? rawData : [];

        // Deduplicate or gather fields matching distinct patterns values
        const uniquePatternsMap = {};
        productsArray.forEach((prod) => {
          if (prod.pattern && !uniquePatternsMap[prod.pattern.toLowerCase()]) {
            uniquePatternsMap[prod.pattern.toLowerCase()] = prod;
          }
        });
        
        const filteredPatterns = Object.values(uniquePatternsMap);
        setPatterns(filteredPatterns.length > 0 ? filteredPatterns : productsArray.slice(0, 6));
        setError(null);
      } catch (err) {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          console.error("Pattern fetch error:", err);
          setError(err.response?.data?.message || err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPatterns();
    return () => controller.abort();
  }, []);

  const handlePatternClick = (patternName) => {
    if (!patternName) return;
    navigate(`/category-products?search=${encodeURIComponent(patternName.trim())}`);
  };

  const handleNext = () => {
    if (!patterns.length) return;
    setCenterIndex((prev) => (prev + 1) % patterns.length);
  };

  const handlePrev = () => {
    if (!patterns.length) return;
    setCenterIndex((prev) => (prev - 1 + patterns.length) % patterns.length);
  };

  // Touch handlers mapping tracking controls
  const handleTouchStart = (e) => { touchStart.current = e.targetTouches[0].clientX; };
  const handleTouchMove = (e) => { touchEnd.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    if (distance > 50) handleNext(); // Left swipe
    if (distance < -50) handlePrev(); // Right swipe
    touchStart.current = 0;
    touchEnd.current = 0;
  };

  if (loading) {
    return (
      <div className="pattern-status-container">
        <p className="pattern-status-text">Loading premium patterns...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pattern-status-container">
        <p className="pattern-status-text error">Error matching patterns: {error}</p>
      </div>
    );
  }

  return (
    <>
      <FeaturesBar />

      <section className="pattern-section">
        {/* LEFT PANEL: Content Controls and Carousel Wrapper */}
        <div className="pattern-left-panel">
          <header className="pattern-header">
            <p className="pattern-sub-tagline">Shop by Pattern</p>
            <h2 className="pattern-main-title">Patterns That Speak Tradition</h2>
          </header>

          <div 
            className="pattern-carousel-viewport"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="pattern-grid">
              {(() => {
                const len = patterns.length;
                if (len === 0) return null;

                const norm = (i) => ((i % len) + len) % len;
                const left = norm(centerIndex - 1);
                const mid = norm(centerIndex);
                const right = norm(centerIndex + 1);

                const windowItems = len === 1 ? [patterns[mid]] : len === 2 ? [patterns[left], patterns[mid]] : [patterns[left], patterns[mid], patterns[right]];

                return windowItems.map((item, wi) => {
                  const patternValue = item.pattern || "Traditional";
                  const displayImage = item.materialImage || item.image || item.imageUrl || (item.images && item.images[0]) || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400';
                  const isFeaturedCard = (windowItems.length === 3 && wi === 1) || (windowItems.length === 2 && wi === 1) || windowItems.length === 1;

                  return (
                    <div 
                      key={item._id || `pattern-${wi}`} 
                      className={`pattern-card ${isFeaturedCard ? "featured" : ""}`}
                      onClick={() => handlePatternClick(patternValue)}
                    >
                      <div className="pattern-image-frame">
                        <img src={displayImage} alt={patternValue} loading="lazy" />
                        <div className={`pattern-overlay ${isFeaturedCard ? "active-overlay" : ""}`}>
                          <span className="pattern-card-title">{patternValue}</span>
                          {isFeaturedCard && (
                            <button className="pattern-card-btn">Shop Now</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          <div className="pattern-controls">
            <button className="ctrl-arrow-btn" aria-label="Previous pattern" onClick={handlePrev}>
              <span className="arrow-icon">&larr;</span>
            </button>
            <button className="ctrl-arrow-btn" aria-label="Next pattern" onClick={handleNext}>
              <span className="arrow-icon">&rarr;</span>
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: Layout Editorial Viewport */}
        <div className="pattern-right-panel">
          <img
            src="https://i.postimg.cc/y87YZM1Y/ba11dc928c38b978d1ca8da124aa9e66.jpg" 
            alt="Models showcasing traditional drapes"
            className="editorial-img"
          />
        </div>
      </section>
    </>
  );
}

export default ShopByPattern;