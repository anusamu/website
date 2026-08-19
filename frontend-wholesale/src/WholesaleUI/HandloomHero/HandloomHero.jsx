import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './HandloomHero.css';

export default function HandloomHero() {
  const navigate = useNavigate();

  return (
    <section className="handloom-hero">
      {/* Background image overlay container */}
      <motion.div 
        className="hero-bg-container"
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <img 
          src="https://i.postimg.cc/QxXRkhTq/Chat-GPT-Image-Jul-10-2026-10-46-17-AM.png" 
          alt="Traditional Indian Handloom Weaving" 
          className="hero-bg-image"
        />
        <div className="hero-overlay"></div>
      </motion.div>

      {/* Editorial Content Frame */}
      <motion.div 
        className="hero-content-wrapper"
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
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

          <motion.button 
            className="hero-action-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/shop')}
          >
            Explore Now
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}
