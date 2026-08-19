import React, { useState, useEffect, useRef } from 'react';

const CustomCursor = () => {
  const [isPointer, setIsPointer] = useState(false);
  
  // Using refs for extreme performance (avoids React re-renders on every mouse move)
  const cursorDotRef = useRef(null);
  const cursorOutlineRef = useRef(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const outlinePos = useRef({ x: -100, y: -100 });
  const requestRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      
      // Update the dot instantly
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%), 0)`;
      }

      // Check if hovering over interactive elements
      const target = e.target;
      setIsPointer(
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') || target.closest('button')
      );
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Smooth fluid trailing loop using requestAnimationFrame
    const animate = () => {
      const ease = 0.15; 
      
      outlinePos.current.x += (mousePos.current.x - outlinePos.current.x) * ease;
      outlinePos.current.y += (mousePos.current.y - outlinePos.current.y) * ease;
      
      if (cursorOutlineRef.current) {
        cursorOutlineRef.current.style.transform = `translate3d(calc(${outlinePos.current.x}px - 50%), calc(${outlinePos.current.y}px - 50%), 0)`;
      }
      
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Hide default cursor globally for true premium feel */}
      <style>{`
        body, a, button, [role="button"], input, select, textarea {
          cursor: none !important;
        }
      `}</style>
      
      {/* Fluid Trailing Outline - Crisp Luxury Design */}
      <div 
        ref={cursorOutlineRef}
        style={{
          ...styles.cursorOutline,
          width: isPointer ? "56px" : "32px",
          height: isPointer ? "56px" : "32px",
          backgroundColor: isPointer ? "rgba(212, 175, 55, 0.15)" : "transparent", // Very sheer gold on hover
          borderColor: isPointer ? "#D4AF37" : "rgba(42, 33, 24, 0.6)", // Pops with solid gold on hover
          borderWidth: isPointer ? "1.5px" : "1px", // Gets slightly thicker
        }}
      />
      {/* Instant Follow Dot */}
      <div 
        ref={cursorDotRef}
        style={{
          ...styles.cursorDot,
          opacity: isPointer ? 0 : 1, 
          transform: isPointer ? "translate3d(-50%, -50%, 0) scale(0)" : "translate3d(-50%, -50%, 0) scale(1)",
        }}
      />
    </>
  );
};

const styles = {
  cursorOutline: {
    position: "fixed",
    top: 0,
    left: 0,
    borderStyle: "solid",
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 9999,
    // Very snappy, high-performance transitions for a crisp feel
    transition: "width 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), height 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.2s ease, border-color 0.2s ease, border-width 0.2s ease",
    willChange: "transform, width, height",
  },
  cursorDot: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "6px",
    height: "6px",
    backgroundColor: "#2A2118", // Dark, highly visible dot
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 10000,
    transition: "opacity 0.2s ease, transform 0.2s ease",
    willChange: "transform, opacity",
  }
};

export default CustomCursor;
