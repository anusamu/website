import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './HandloomHero.css';

export default function HandloomHero() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Parallax scroll effect for background
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Background moves slightly down as user scrolls down
  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  return (
    <section ref={containerRef} className="handloom-hero" style={{ overflow: "hidden" }}>
      {/* Background image overlay container */}
      <div className="hero-bg-container">
        <motion.img 
          style={{ y, scale: 1.2 }}
          src="https://i.postimg.cc/QxXRkhTq/Chat-GPT-Image-Jul-10-2026-10-46-17-AM.png" 
          alt="Traditional Indian Handloom Weaving" 
          className="hero-bg-image"
        />
        <div className="hero-overlay"></div>
      </div>

      {/* Editorial Content Frame */}
      <motion.div 
        className="hero-content-wrapper"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <header className="hero-header">
          <span className="hero-brand-sub">Rajagopal</span>
          <h1 className="hero-brand-main">Handlooms</h1>
        </header>

        <div className="hero-body">
          <h2 className="hero-tagline">
            Weaving Heritage,<br />Crafting Stories.
          </h2>
          
          <p className="hero-description">
            At RG Handlooms, every thread reflects a rich heritage of 
            craftsmanship and tradition. Our timeless handloom creations are 
            thoughtfully woven to celebrate elegance, authenticity, and the 
            stories behind every weave.
          </p>

          <button className="hero-action-btn" onClick={() => navigate('/shop')}>
            Explore Now
          </button>
        </div>
      </motion.div>
    </section>
  );
}