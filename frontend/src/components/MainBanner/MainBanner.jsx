import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./MainBanner.css";

// Slideshow Dataset Mapping
const BANNER_SLIDES = [
  {
    id: "slide_01",
    subtitle: "Handwoven, Heartmade",
    title: "The Beauty of Handloom",
    description: "Discover premium clothing crafted with quality in mind. Explore pieces that effortlessly complement your lifestyle.",
    image: "https://i.postimg.cc/Znn1rL94/Gemini-Generated-Image-m1dzf7m1dzf7m1dz.png"
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

  // Animation variants for staggered text reveal
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // Stagger effect
        delayChildren: 0.2,
      }
    },
    exit: { opacity: 0, transition: { duration: 0.6 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <section className="hero-banner-container" aria-label="Featured Collection Banner">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          className="hero-slide slide-active"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          <div className="hero-grid">
            
            {/* Left Content Column */}
            <div className="hero-content-col">
              <motion.span variants={itemVariants} className="hero-subtitle">
                {BANNER_SLIDES[currentSlide].subtitle}
              </motion.span>
              <motion.h1 variants={itemVariants} className="hero-title">
                {BANNER_SLIDES[currentSlide].title}
              </motion.h1>
              <motion.p variants={itemVariants} className="hero-description">
                {BANNER_SLIDES[currentSlide].description}
              </motion.p>
              
              <motion.div variants={itemVariants} className="hero-btn-group">
                <button 
                  onClick={() => navigate("/shop")} 
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
              </motion.div>
            </div>

            {/* Right Graphic/Asset Viewport Column */}
            <div className="hero-image-col">
              <div className="hero-image-wrapper">
                <motion.img 
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                  src={BANNER_SLIDES[currentSlide].image} 
                  alt={BANNER_SLIDES[currentSlide].title} 
                  className="hero-raw-img"
                  loading={currentSlide === 0 ? "eager" : "lazy"}
                />
              </div>
            </div>

          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

export default MainBanner;