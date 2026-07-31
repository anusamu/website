import React, { useState, useCallback, useRef, useEffect } from "react";
import "./FloatingFlowers.css";

const FloatingFlowers = ({ count = 16 }) => {
  // 1. ALL Hooks declared at the top level in exact order
  const containerRef = useRef(null);
  const [bursts, setBursts] = useState([]);
  const [activeItems, setActiveItems] = useState([]);

  // Fetch active items from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/floating/active")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setActiveItems(data.data);
        }
      })
      .catch((err) => console.error("Error loading animation items:", err));
  }, []);

  // 2. useCallback MUST be placed BEFORE any 'if/return' checks
  const handleFlowerClick = useCallback((e, particleSymbol) => {
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
    setTimeout(() => flowerEl.classList.remove("popped"), 600);
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.burstId !== burstId));
    }, 700);
  }, []);

  // 3. NOW you can safely do conditional checks/early returns
  if (activeItems.length === 0) return null;

  // Build items array by cycling through fetched items
  const items = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    ...activeItems[i % activeItems.length],
  }));

  return (
    <div className="floating-flowers" aria-hidden="true" ref={containerRef}>
      {items.map((item, idx) => (
        <span
          key={`${item._id}-${idx}`}
          className={`flower f${(idx % 16) + 1}`}
          onClick={(e) => handleFlowerClick(e, item.particleSymbol || "✨")}
        >
          {item.type === "image" ? (
            <img src={`http://localhost:5000${item.content}`} alt={item.title} className="floating-img" />
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