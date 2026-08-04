import React, { useState, useCallback, useRef, useEffect } from "react";
import "./FloatingFlowers.css";

const FloatingFlowers = ({ count = 22 }) => {
  // 1. ALL Hooks declared at the top level in exact order
  const containerRef = useRef(null);
  const [bursts, setBursts] = useState([]);
  const [activeItems, setActiveItems] = useState([]);
  const [offsets, setOffsets] = useState({});

  // Generate completely random, but non-overlapping horizontal positions (lanes) on mount
  const [randomLefts] = useState(() => {
    // Fixed shuffled lanes (stride of 9 out of 22) to guarantee maximum horizontal distance 
    // This strictly prevents any two emojis that spawn near each other in time from being near each other horizontally
    const lanes = [0, 9, 18, 5, 14, 1, 10, 19, 6, 15, 2, 11, 20, 7, 16, 3, 12, 21, 8, 17, 4, 13];
    const lefts = {};
    for (let i = 0; i < 22; i++) {
      // 22 lanes = ~4.54% each. Add 1% padding and 1% jitter so they don't clip edges
      lefts[i] = (lanes[i] * 4.54) + 1 + (Math.random() * 1);
    }
    return lefts;
  });

  // Fetch active items from backend
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    fetch(`${apiUrl}/floating/active`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setActiveItems(data.data);
        }
      })
      .catch((err) => console.error("Error loading animation items:", err));
  }, []);

  // 2. useCallback MUST be placed BEFORE any 'if/return' checks
  const handleFlowerClick = useCallback((e, particleSymbol, idx) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const flowerRect = e.currentTarget.getBoundingClientRect();

    const x = flowerRect.left - containerRect.left + flowerRect.width / 2;
    const y = flowerRect.top - containerRect.top + flowerRect.height / 2;

    const burstId = Date.now() + Math.random();
    const particleCount = 8;

    const particles = Array.from({ length: particleCount }, (_, i) => ({
      pid: i,
      angle: (360 / particleCount) * i,
    }));

    setBursts((prev) => [...prev, { burstId, x, y, particles, particleSymbol }]);

    const flowerEl = e.currentTarget;
    flowerEl.classList.add("popped");
    setTimeout(() => {
      flowerEl.classList.remove("popped");
      // Cycle to a new emoji seamlessly while hidden
      setOffsets((prev) => ({
        ...prev,
        [idx]: (prev[idx] || 0) + 1
      }));
    }, 600);
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.burstId !== burstId));
    }, 700);
  }, []);

  // 3. NOW you can safely do conditional checks/early returns
  if (activeItems.length === 0) return null;

  // Build items array by cycling through fetched items with individual offsets
  const items = Array.from({ length: count }, (_, i) => {
    const offset = offsets[i] || 0;
    const activeItem = activeItems[(i + offset) % activeItems.length];
    return {
      idx: i,
      ...activeItem,
    };
  });

  return (
    <div className="floating-flowers" aria-hidden="true" ref={containerRef}>
      {items.map((item) => (
        <span
          key={`flower-slot-${item.idx}`} // Stable key prevents DOM destruction, allowing smooth fade-in
          className={`flower f${(item.idx % 22) + 1}`}
          style={{ left: `${randomLefts[item.idx]}%` }}
          onClick={(e) => handleFlowerClick(e, item.particleSymbol || "✨", item.idx)}
        >
          {item.type === "image" ? (
            <img src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : "http://localhost:5000"}${item.content}`} alt={item.title} className="floating-img" />
          ) : (
            item.content
          )}
        </span>
      ))}

      {bursts.map((burst) => (
        <span key={burst.burstId} className="burst-origin" style={{ left: burst.x, top: burst.y }}>
          {burst.particles.map((p) => (
            <span key={p.pid} className="burst-particle" style={{ "--angle": `${p.angle}deg` }}>
              {burst.particleSymbol}
            </span>
          ))}
        </span>
      ))}
    </div>
  );
};

export default FloatingFlowers;