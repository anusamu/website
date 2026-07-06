import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MainBanner.css";

// Slideshow Dataset Mapping
const BANNER_SLIDES = [
  {
    id: "slide_01",
    subtitle: "Handwoven, Heartmade",
    title: "The Beauty of Handloom",
    description: "Discover premium clothing crafted with quality in mind. Explore pieces that effortlessly complement your lifestyle.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "slide_02",
    subtitle: "Heritage & Tradition",
    title: "Timeless Bridal Weaves",
    description: "Immerse yourself in authentic pure silk threads sourced and woven meticulously by master artisans across heritage guilds.",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80"
  }
];

const MainBanner = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance loop tracking for the cross-fade carousel engine
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 7000); // Transitions automatically cycle every 7 seconds

    return () => clearInterval(slideInterval);
  }, []);

  return (
    <section className="hero-banner-container" aria-label="Featured Collection Banner">
      {BANNER_SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={`hero-slide ${index === currentSlide ? "slide-active" : ""}`}
        >
          <div className="hero-grid">
            
            {/* Left Content Column */}
            <div className="hero-content-col">
              <span className="hero-subtitle">{slide.subtitle}</span>
              <h1 className="hero-title">{slide.title}</h1>
              <p className="hero-description">{slide.description}</p>
              
              <div className="hero-btn-group">
                <button 
                  onClick={() => navigate("/products")} 
                  className="btn-shop-collection"
                >
                  Shop Collection
                </button>
                <button 
                  onClick={() => navigate("/lookbook")} 
                  className="btn-explore-lookbook"
                >
                  Explore Lookbook
                </button>
              </div>
            </div>

            {/* Right Graphic/Asset Viewport Column */}
            <div className="hero-image-col">
              <div className="hero-image-wrapper">
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className="hero-raw-img"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            </div>

          </div>
        </div>
      ))}
    </section>
  );
};

export default MainBanner;