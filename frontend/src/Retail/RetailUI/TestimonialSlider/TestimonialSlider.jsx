import React, { useState, useEffect } from 'react';
import './TestimonialSlider.css';

const initialTestimonials = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1514846226882-28b324ef7f28?auto=format&fit=crop&w=600&q=80",
    title: "Quality, Fit and Care",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit."
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    title: "Absolute Perfection",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit."
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    title: "Timeless Heritage Drapes",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit."
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
    title: "Premium Fabric Weaving",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit."
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
    title: "Superb Wedding Collection",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit."
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
    title: "Incredible Fit & Style",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit."
  }
];

export default function TestimonialSlider() {
  // We double the elements array slightly to create room for smooth entry/exit animations
  const [list, setList] = useState(initialTestimonials);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);

      // Wait exactly for the css translation effect to finish, then cycle the array values
      setTimeout(() => {
        setList((prevList) => {
          const [first, ...rest] = prevList;
          return [...rest, first];
        });
        setIsAnimating(false);
      }, 700); // Syncs with transition duration

    }, 3500); // Interval step delay

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="testimonial-section">
      <h2 className="testimonial-section-title">Trusted for Every Special Occasion</h2>
      
      <div className="slider-container-window">
        {/* Horizontal Moving Track */}
        <div className={`testimonial-slider-track ${isAnimating ? 'is-shifting' : ''}`}>
          {list.map((item, index) => (
            <div 
              key={`${item.id}-${index}`} 
              className={`testimonial-card ${index >= 2 ? 'is-peek' : ''}`}
            >
              {/* Left Column: Portrait */}
              <div className="testimonial-image-wrapper">
                <img src={item.image} alt={item.title} className="testimonial-img" />
              </div>
              
              {/* Right Column: Review Text Content */}
              <div className="testimonial-content">
                <div className="testimonial-stars">★★★★★</div>
                <h3 className="testimonial-card-title">{item.title}</h3>
                <p className="testimonial-text">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}