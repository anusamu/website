import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './WeavingStories.css';

export default function WeavingStories() {
  const [items, setItems] = useState([]);
  const [likedId, setLikedId] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const backendUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace("/api", "")
    : "http://localhost:5000";

  useEffect(() => {
    fetch(`${apiUrl}/weaving-stories/active`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setItems(data.data);
      })
      .catch(err => console.error("Error fetching weaving stories:", err));
  }, []);

  const handleCardClick = (id) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item._id === id ? { ...item, likes: item.likes + 1 } : item
      )
    );

    fetch(`${apiUrl}/weaving-stories/like/${id}`, { method: 'POST' }).catch(console.error);

    // Trigger the micro-burst heart animation overlay
    setLikedId(id);
    setTimeout(() => setLikedId(null), 800);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <section className="stories-section">
      {/* Background/Watermark Section Title */}
      <div className="stories-watermark-bg">
        OUR WEAVING STORIES
      </div>

      {/* Grid Canvas */}
      <motion.div
        className="stories-grid-container"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        {items.map((item) => (
          <motion.div
            variants={itemVariants}
            key={item._id}
            className="story-card"
            onClick={() => handleCardClick(item._id)}
            whileHover={{ scale: 1.05 }}
          >
            <div className="story-image-frame">
              <img src={item.imageUrl} alt="Handloom showcase" className="story-img" />
            </div>

            {/* Persistent Hover Overlay */}
            <div className="story-overlay">
              <div className="story-like-stats">
                <span className="heart-icon-static">♥</span> {item.likes} Likes
              </div>
            </div>

            {/* Dynamic Click Animation Burst Overlay */}
            {likedId === item._id && (
              <div className="click-burst-overlay">
                <span className="burst-heart">♥</span>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

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