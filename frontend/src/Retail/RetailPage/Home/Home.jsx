import React from "react";
import Navbar from "../../../components/Navbar/Navbar";
import MainBanner from "../../../components/MainBanner/MainBanner";
import ScrollCard from "../.././RetailUI/ScrollCard/ScrollCard";
import ShopByCategory from "../.././RetailUI/ShopByCategory/ShopByCategory";
import Footer from "../../../components/Footer/Footer";
import ShopByPattern from "../.././RetailUI/ShopByPattern/ShopByPattern";
import HandloomHero from "../.././RetailUI/HandloomHero/HandloomHero";
import TestimonialSlider from "../.././RetailUI/TestimonialSlider/TestimonialSlider";
import WeavingStories from "../.././RetailUI/WeavingStories/WeavingStories";

const Home = () => {
  return (
    <div className="home-page-wrapper" style={styles.pageWrapper}>
      <header>
        <Navbar />
      </header>

      {/* Main viewport is compacted with zero gaps to fully blend the UI sections */}
      <main style={styles.mainContent}>
        <MainBanner />
        <ScrollCard />
        <ShopByCategory />
        <ShopByPattern/>
        <HandloomHero/>
        <TestimonialSlider/>
        <WeavingStories/>
        
      </main>

      <footer style={styles.footerPush}>
        <Footer />
      </footer>
    </div>
  );
};

/* ==========================================================================
   Seamless Layout Structural Styles
   ========================================================================== */
const styles = {
  pageWrapper: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    paddingTop: "0",
    backgroundColor: "#ffffff",
    overflowX: "hidden",
  },
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "10px", 
  /* Gaps completely removed so sections flow directly into each other */
  },
  footerPush: {
    marginTop: "auto",
  },
};

export default Home;