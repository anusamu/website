import React, { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";
import "./CustomCursor.css";

const CustomCursor = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Sharper physics for a neater, less laggy feel
  const cursorX = useSpring(0, { stiffness: 400, damping: 28 });
  const cursorY = useSpring(0, { stiffness: 400, damping: 28 });

  useEffect(() => {
    // Check mobile
    if (window.innerWidth < 768) {
      setIsMobile(true);
      return;
    }

    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        window.getComputedStyle(target).cursor === "pointer"
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY]);

  if (isMobile) return null;

  return (
    <motion.div
      className="custom-cursor-aura"
      style={{
        x: cursorX,
        y: cursorY,
      }}
      animate={{
        scale: isHovering ? 1.4 : 1,
        borderColor: isHovering ? "rgba(233, 169, 51, 1)" : "rgba(233, 169, 51, 0.6)",
        backgroundColor: isHovering ? "rgba(233, 169, 51, 0.1)" : "rgba(233, 169, 51, 0)",
      }}
      transition={{ duration: 0.15 }}
    />
  );
};

export default CustomCursor;
