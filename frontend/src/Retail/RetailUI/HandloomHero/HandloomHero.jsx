import React from 'react';
import './HandloomHero.css';

export default function HandloomHero() {
  return (
    <section className="handloom-hero">
      {/* Background image overlay container */}
      <div className="hero-bg-container">
        <img 
          src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1800&q=80" 
          alt="Traditional Indian Handloom Weaving" 
          className="hero-bg-image"
        />
        <div className="hero-overlay"></div>
      </div>

      {/* Editorial Content Frame */}
      <div className="hero-content-wrapper">
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

          <button className="hero-action-btn" onClick={() => console.log('Explore clicked')}>
            Explore Now
          </button>
        </div>
      </div>
    </section>
  );
}