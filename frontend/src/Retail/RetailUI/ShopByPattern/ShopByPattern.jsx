import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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

        // DEDUPLICATION: Gather exactly ONE product per distinct material (or pattern fallback)
        const uniqueMaterialMap = {};
        productsArray.forEach((prod) => {
          const matKey = (prod.material || prod.pattern || "").trim().toLowerCase();
          if (matKey && !uniqueMaterialMap[matKey]) {
            uniqueMaterialMap[matKey] = prod;
          }
        });
        
        const filteredPatterns = Object.values(uniqueMaterialMap);
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

  // Calculate distance for CoverFlow
  const getIndexDistance = (index) => {
    let diff = index - centerIndex;
    const len = patterns.length;
    if (diff > len / 2) diff -= len;
    if (diff < -len / 2) diff += len;
    return diff;
  };

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
            style={{ position: 'relative', overflow: 'hidden', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <AnimatePresence initial={false}>
              {patterns.map((item, index) => {
                const diff = getIndexDistance(index);
                // Only render items that are close to the center to save DOM nodes
                if (Math.abs(diff) > 2) return null;

                const patternValue = item.material || item.pattern || "Pattern";
                const displayImage = item.materialImage || item.image || item.imageUrl || (item.images && item.images[0]) || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400';
                const isCenter = diff === 0;

                return (
                  <motion.div 
                    key={item._id || index}
                    onClick={() => {
                      if (isCenter) handlePatternClick(patternValue);
                      else if (diff > 0) handleNext();
                      else handlePrev();
                    }}
                    initial={{ opacity: 0, x: diff * 120 + "%", scale: 0.8 }}
                    animate={{
                      opacity: Math.abs(diff) > 1 ? 0 : 1,
                      x: diff * 110 + "%",
                      scale: 1 - Math.abs(diff) * 0.15,
                      zIndex: 10 - Math.abs(diff),
                      filter: Math.abs(diff) > 0 ? "brightness(0.6)" : "brightness(1)",
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    style={{ position: 'absolute', width: '250px', cursor: 'pointer' }}
                  >
                    <div className="pattern-image-frame" style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: isCenter ? '0 20px 40px rgba(0,0,0,0.2)' : 'none' }}>
                      <img src={displayImage} alt={patternValue} loading="lazy" style={{ width: '100%', height: '350px', objectFit: 'cover' }} />
                      <div className={`pattern-overlay ${isCenter ? "active-overlay" : ""}`} style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1.5rem', opacity: isCenter ? 1 : 0, transition: 'opacity 0.3s' }}>
                        <span className="pattern-card-title" style={{ color: 'white', fontSize: '1.25rem', fontFamily: 'Playfair Display, serif' }}>{patternValue}</span>
                        {isCenter && (
                          <button className="pattern-card-btn" style={{ marginTop: '0.5rem', alignSelf: 'flex-start', background: 'white', color: 'black', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 'bold' }}>Shop Now</button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="pattern-controls" style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="ctrl-arrow-btn" aria-label="Previous pattern" onClick={handlePrev} style={{ background: '#f0f0f0', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#e0e0e0'} onMouseLeave={(e) => e.currentTarget.style.background = '#f0f0f0'}>
              <span className="arrow-icon">&larr;</span>
            </button>
            <button className="ctrl-arrow-btn" aria-label="Next pattern" onClick={handleNext} style={{ background: '#f0f0f0', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#e0e0e0'} onMouseLeave={(e) => e.currentTarget.style.background = '#f0f0f0'}>
              <span className="arrow-icon">&rarr;</span>
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: Layout Editorial Viewport */}
        <div className="pattern-right-panel" style={{ overflow: 'hidden' }}>
          <motion.img
            initial={{ scale: 1.1 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            viewport={{ once: true }}
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