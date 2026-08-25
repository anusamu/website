import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../../components/Navbar/Navbar";
import MainBanner from "../../../components/MainBanner/MainBanner";
import ScrollCard from "../.././RetailUI/ScrollCard/ScrollCard";
import ShopByCategory from "../.././RetailUI/ShopByCategory/ShopByCategory";
import Footer from "../../../components/Footer/Footer";
import ShopByPattern from "../.././RetailUI/ShopByPattern/ShopByPattern";
import HandloomHero from "../.././RetailUI/HandloomHero/HandloomHero";
import TestimonialSlider from "../.././RetailUI/TestimonialSlider/TestimonialSlider";
import WeavingStories from "../.././RetailUI/WeavingStories/WeavingStories";
import CustomCursor from "../../../components/CustomCursor/CustomCursor";
import SplashLanding from "../../RetailUI/SplashLanding/SplashLanding";

// Reusable animation wrapper for seamless scroll reveals
const FadeInSection = ({ children, delay = 0, style }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    style={style}
  >
    {children}
  </motion.div>
);

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Show splash only when on root path "/"
  const [showSplash, setShowSplash] = useState(() => location.pathname === "/");
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (location.pathname === "/" && !isTransitioning) {
      setShowSplash(true);
    } else if (location.pathname !== "/" && !isTransitioning) {
      setShowSplash(false);
    }
  }, [location.pathname, isTransitioning]);

  const handleStartTransition = () => {
    setIsTransitioning(true);
  };

  const handleDismissSplash = () => {
    setShowSplash(false);
    setIsTransitioning(false);
    // Smoothly update browser address bar to /home once the slow cross-fade completes
    navigate("/home", { replace: true });
  };

  // Home is active when not on splash or when actively transitioning
  const isHomeActive = !showSplash || isTransitioning;

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <SplashLanding 
            onStartTransition={handleStartTransition} 
            onDismiss={handleDismissSplash} 
          />
        )}
      </AnimatePresence>

      <motion.div 
        className="home-page-wrapper" 
        style={styles.pageWrapper}
        initial={{ opacity: showSplash ? 0 : 1, scale: showSplash ? 0.985 : 1 }}
        animate={{ 
          opacity: isHomeActive ? 1 : 0, 
          scale: isHomeActive ? 1 : 0.985 
        }}
        transition={{ duration: 1.35, ease: [0.25, 1, 0.5, 1] }}
      >
        <CustomCursor />
        <header style={styles.header}>
          <Navbar />
        </header>

        {/* Main viewport is compacted but uses FadeInSection for premium reveals */}
        <main style={styles.mainContent}>
          {/* Main Banner rendered cleanly in-place */}
          <MainBanner />

          {/* Subsequent sections animate in as they scroll into view */}
          <FadeInSection>
            <ScrollCard />
          </FadeInSection>

          <FadeInSection>
            <ShopByCategory />
          </FadeInSection>

          <FadeInSection>
            <ShopByPattern/>
          </FadeInSection>

          <FadeInSection>
            <HandloomHero/>
          </FadeInSection>

          <FadeInSection>
            <TestimonialSlider/>
          </FadeInSection>

          <FadeInSection>
            <WeavingStories/>
          </FadeInSection>
        </main>

        <footer style={styles.footerPush}>
          <Footer />
        </footer>
      </motion.div>
    </>
  );
};

/* ==========================================================================
   Premium Seamless Layout Structural Styles
   ========================================================================== */
const styles = {
  pageWrapper: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    paddingTop: "0",
    backgroundColor: "#FAFAFA",
    overflowX: "hidden",
    transformOrigin: "center top",
    willChange: "transform, opacity",
  },
  header: {
    position: "relative",
    zIndex: 10,
  },
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0px",
    position: "relative",
    zIndex: 5,
  },
  footerPush: {
    marginTop: "auto",
    position: "relative",
    zIndex: 10,
  }
};

export default Home;