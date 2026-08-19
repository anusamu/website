import React from "react";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar/Navbar";
import MainBanner from "../../components/MainBanner/MainBanner";
import ScrollCard from "../.././WholesaleUI/ScrollCard/ScrollCard";
import ShopByCategory from "../.././WholesaleUI/ShopByCategory/ShopByCategory";
import Footer from "../../components/Footer/Footer";
import ShopByPattern from "../.././WholesaleUI/ShopByPattern/ShopByPattern";
import HandloomHero from "../.././WholesaleUI/HandloomHero/HandloomHero";
import TestimonialSlider from "../.././WholesaleUI/TestimonialSlider/TestimonialSlider";
import WeavingStories from "../.././WholesaleUI/WeavingStories/WeavingStories";
import CustomCursor from "../.././components/CustomCursor/CustomCursor";

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
  return (
    <div className="home-page-wrapper" style={styles.pageWrapper}>
      <CustomCursor />
      <header style={styles.header}>
        <Navbar />
      </header>

      {/* Main viewport is compacted but uses FadeInSection for premium reveals */}
      <main style={styles.mainContent}>
        {/* Main Banner usually needs to render immediately without delay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <MainBanner />
        </motion.div>

        {/* Subsequent sections animate in as they scroll into view */}
        <FadeInSection>
          <ScrollCard />
        </FadeInSection>

        <FadeInSection>
          <ShopByCategory />
        </FadeInSection>

        <FadeInSection>
          <ShopByPattern />
        </FadeInSection>

        <FadeInSection>
          <HandloomHero />
        </FadeInSection>

        <FadeInSection>
          <TestimonialSlider />
        </FadeInSection>

        <FadeInSection>
          <WeavingStories />
        </FadeInSection>
      </main>

      <footer style={styles.footerPush}>
        <Footer />
      </footer>
    </div>
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
    backgroundColor: "#FAFAFA", // A premium soft background instead of harsh white
    overflowX: "hidden",
  },
  header: {
    position: "relative",
    zIndex: 10,
  },
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0px", // Maintained gap: 0px to prevent breaking edge-to-edge designs
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
