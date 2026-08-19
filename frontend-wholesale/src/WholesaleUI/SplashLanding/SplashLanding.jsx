import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SplashLanding.css';
import landingBg from '../../assets/historic_landing.jpg';

const SplashContent = () => (
  <>
    <div className="splash-bg-wrapper">
      <img
        src={landingBg}
        alt="Rajagopal Handloom Landing"
        className="splash-bg-img"
        onError={(e) => {
          e.target.src = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1920";
        }}
      />
      <div className="splash-gradient-overlay" />
    </div>

    <div className="splash-content">
      <div className="brand-marks">
        <p className="splash-sub-brand">Rajagopal Handloom</p>
        <h1 className="splash-main-title">A Legacy of Weaving</h1>
      </div>

      <div className="splash-cta">
        <div className="scroll-icon-container">
          <span className="scroll-wheel" />
        </div>
        <p>Click or Scroll to Enter</p>
      </div>
    </div>
  </>
);

export default function SplashLanding({ onDismiss }) {
  const [isDismissing, setIsDismissing] = useState(false);

  const handleDismiss = () => {
    if (isDismissing) return;
    setIsDismissing(true);
    // Wait for fade animation to complete
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 800);
  };

  useEffect(() => {
    const handleInteraction = () => handleDismiss();

    window.addEventListener('click', handleInteraction);
    window.addEventListener('wheel', handleInteraction, { passive: true });
    window.addEventListener('touchstart', handleInteraction, { passive: true });
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('wheel', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [isDismissing]);

  return (
    <div className={`splash-landing-container ${isDismissing ? 'dismissing' : ''}`}>
      <AnimatePresence>
        {!isDismissing && (
          <motion.div
            key="splash-content"
            exit={{
              opacity: 0,
              transition: {
                duration: 0.8,
                ease: "easeInOut"
              }
            }}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          >
            <SplashContent />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
