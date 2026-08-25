import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SplashLanding.css';
import landingBg from '../../../assets/historic_landing.jpg';

export default function SplashLanding({ onStartTransition, onDismiss }) {
  const [isDismissing, setIsDismissing] = useState(false);

  const handleDismiss = useCallback(() => {
    if (isDismissing) return;
    setIsDismissing(true);
    if (onStartTransition) onStartTransition();

    // Slow, graceful luxury transition duration (1.35s)
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 1350);
  }, [isDismissing, onStartTransition, onDismiss]);

  useEffect(() => {
    if (isDismissing) return;

    const handleInteraction = (e) => {
      if (e.type === 'click' && e.button !== 0) return;
      handleDismiss();
    };

    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('wheel', handleInteraction, { passive: true, once: true });
    window.addEventListener('touchstart', handleInteraction, { passive: true, once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });

    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('wheel', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      document.body.style.overflow = '';
    };
  }, [isDismissing, handleDismiss]);

  // Gentle, smooth easing curve
  const smoothLuxuryEase = [0.25, 1, 0.5, 1];

  return (
    <div className={`splash-landing-container ${isDismissing ? 'dismissing' : ''}`}>
      <AnimatePresence>
        {!isDismissing && (
          <motion.div
            className="splash-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              scale: 1.025,
              transition: { duration: 1.35, ease: smoothLuxuryEase }
            }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              willChange: 'transform, opacity',
            }}
          >
            {/* Background Graphic Layer */}
            <motion.div 
              className="splash-bg-wrapper"
              initial={{ scale: 1.05 }}
              animate={{ scale: 1.0 }}
              transition={{ duration: 1.8, ease: "easeOut" }}
            >
              <img
                src={landingBg}
                alt="Rajagopal Handloom Heritage"
                className="splash-bg-img"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1920";
                }}
              />
              <div className="splash-gradient-overlay" />
              <div className="splash-vignette-overlay" />
            </motion.div>

            {/* Foreground Content */}
            <div className="splash-content">
              {/* Brand Typography */}
              <motion.div 
                className="brand-marks"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: -20,
                  transition: { duration: 0.9, ease: smoothLuxuryEase }
                }}
                transition={{ duration: 1.1, delay: 0.1, ease: smoothLuxuryEase }}
              >
                <div className="splash-brand-emblem">
                  <span className="emblem-line"></span>
                  <span className="emblem-diamond">✦</span>
                  <span className="emblem-line"></span>
                </div>
                <p className="splash-sub-brand">Rajagopal Handloom</p>
                <h1 className="splash-main-title">A Legacy of Weaving</h1>
                <p className="splash-tagline">Pure Silk • Heritage Artistry • Timeless Elegance</p>
              </motion.div>

              {/* Call to Action Trigger */}
              <motion.div 
                className="splash-cta"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: { duration: 0.4, ease: "easeIn" }
                }}
                transition={{ duration: 0.9, delay: 0.3, ease: smoothLuxuryEase }}
                onClick={handleDismiss}
              >
                <div className="scroll-icon-container">
                  <span className="scroll-wheel" />
                </div>
                <p className="splash-cta-text">Click or Scroll to Enter</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
