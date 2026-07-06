import React, { useState, useEffect } from "react";
import "./ShopByPattern.css";
import api from "../../../api";

// 1. New Features Bar Sub-Component matching the exact icons and subtitles from the image
function FeaturesBar() {
  return (
    <div className="features-bar-container">
      <div className="features-inner-wrapper">
        
        {/* Item 1: Free Shipping */}
        <div className="feature-item">
          <div className="feature-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 18h14M5 14h14M14 6l3 3v5M3 9h11v5H3V9z" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6.5" cy="16.5" r="1.5"/>
              <circle cx="14.5" cy="16.5" r="1.5"/>
            </svg>
          </div>
          <div className="feature-text-content">
            <h4 className="feature-title">Free Shipping</h4>
            <p className="feature-desc">On orders above ₹1999</p>
          </div>
        </div>

        {/* Item 2: Easy Returns */}
        <div className="feature-item">
          <div className="feature-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l.73-1.19" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="feature-text-content">
            <h4 className="feature-title">Easy Returns</h4>
            <p className="feature-desc">Within 7 Days</p>
          </div>
        </div>

        {/* Item 3: Premium Quality */}
        <div className="feature-item">
          <div className="feature-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="feature-text-content">
            <h4 className="feature-title">Premium Quality</h4>
            <p className="feature-desc">Finest Fabrics</p>
          </div>
        </div>

        {/* Item 4: Secure Payments */}
        <div className="feature-item">
          <div className="feature-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="feature-text-content">
            <h4 className="feature-title">Secure Payments</h4>
            <p className="feature-desc">100% Secure checkout</p>
          </div>
        </div>

        {/* Item 5: 24/7 Support */}
        <div className="feature-item">
          <div className="feature-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="feature-text-content">
            <h4 className="feature-title">24/7 Support</h4>
            <p className="feature-desc">We're here to help</p>
          </div>
        </div>

      </div>
    </div>
  );
}

function ShopByPattern() {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const controller = new AbortController();
  const signal = controller.signal;

  const fetchPatterns = async () => {
    try {
      setLoading(true);

      const response = await api.get("/products", {
        signal,
      });

      const data = response.data;

      setPatterns(data.slice(0, 3));
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

  return () => {
    controller.abort();
  };
}, []);

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
      {/* Imaged features segment rendering directly above our product workspace */}
      <FeaturesBar />

      <section className="pattern-section">
        {/* LEFT SIDE: Content, Grid, Controls */}
        <div className="pattern-left-panel">
          <header className="pattern-header">
            <p className="pattern-sub-tagline">Shop by Pattern</p>
            <h2 className="pattern-main-title">Patterns That Speak Tradition</h2>
          </header>

          <div className="pattern-grid">
            {patterns.map((item, index) => {
              const title = item.title || item.name || "Pattern";
              const displayImage = item.image || item.imageUrl;
              const isFeaturedCard = index === 1;

              return (
                <div key={item._id || index} className="pattern-card">
                  <div className="pattern-image-frame">
                    <img src={displayImage} alt={title} loading="lazy" />
                    <div className={`pattern-overlay ${isFeaturedCard ? "active-overlay" : ""}`}>
                      <span className="pattern-card-title">{title}</span>
                      {isFeaturedCard && (
                        <button className="pattern-card-btn">Shop Now</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel Arrow Controls */}
          <div className="pattern-controls">
            <button className="ctrl-arrow-btn" aria-label="Previous pattern">
              <span className="arrow-icon">←</span>
            </button>
            <button className="ctrl-arrow-btn" aria-label="Next pattern">
              <span className="arrow-icon">→</span>
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: Rich Contextual Editorial Image */}
        <div className="pattern-right-panel">
          <img
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1000" 
            alt="Models showcasing traditional drapes"
            className="editorial-img"
          />
        </div>
      </section>
    </>
  );
}

export default ShopByPattern;