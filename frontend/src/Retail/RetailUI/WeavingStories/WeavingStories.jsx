import React, { useState } from 'react';
import './WeavingStories.css';

const initialGalleryData = [
  { id: 1, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80", initialLikes: 98 },
  { id: 2, image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80", initialLikes: 124 },
  { id: 3, image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80", initialLikes: 85 },
  { id: 4, image: "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=600&q=80", initialLikes: 210 },
  { id: 5, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80", initialLikes: 93 },
  { id: 6, image: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=600&q=80", initialLikes: 142 },
  { id: 7, image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80", initialLikes: 64 },
  { id: 8, image: "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=600&q=80", initialLikes: 119 },
  { id: 9, image: "https://images.unsplash.com/photo-1566207274740-0f8cf6b7d5a5?auto=format&fit=crop&w=600&q=80", initialLikes: 76 },
  { id: 10, image: "https://images.unsplash.com/photo-1605497746444-ac9dbd39f6a4?auto=format&fit=crop&w=600&q=80", initialLikes: 153 }
];

export default function WeavingStories() {
  const [items, setItems] = useState(initialGalleryData);
  const [likedId, setLikedId] = useState(null);

  const handleCardClick = (id) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, initialLikes: item.initialLikes + 1 } : item
      )
    );
    
    // Trigger the micro-burst heart animation overlay
    setLikedId(id);
    setTimeout(() => setLikedId(null), 800);
  };

  return (
    <section className="stories-section">
      {/* Background/Watermark Section Title */}
      <div className="stories-watermark-bg">
        OUR WEAVING STORIES
      </div>

      {/* Grid Canvas */}
      <div className="stories-grid-container">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="story-card"
            onClick={() => handleCardClick(item.id)}
          >
            <div className="story-image-frame">
              <img src={item.image} alt="Handloom showcase" className="story-img" />
            </div>

            {/* Persistent Hover Overlay */}
            <div className="story-overlay">
              <div className="story-like-stats">
                <span className="heart-icon-static">♥</span> {item.initialLikes} Likes
              </div>
            </div>

            {/* Dynamic Click Animation Burst Overlay */}
            {likedId === item.id && (
              <div className="click-burst-overlay">
                <span className="burst-heart">♥</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Social Footer Anchor */}
      <footer className="stories-footer">
        <a 
          href="https://instagram.com/rajagpalhandlomm" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="instagram-link"
        >
          <span className="instagram-icon-mock">📷</span>
          <span className="instagram-handle">/rajagpalhandlomm</span>
        </a>
      </footer>
    </section>
  );
}