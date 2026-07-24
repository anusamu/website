import React, { useState, useCallback, useRef } from "react";
import "./FloatingFlowers.css";

const DEFAULT_FLOWERS = ["🌸", "🌼"];
let burstIdCounter = 0;

/**
 * Reusable ambient floating-flower background animation.
 * Drop <FloatingFlowers /> as the first child inside any
 * `position: relative` section/container that has overflow: hidden.
 *
 * Props:
 *  - count: number of flowers to render (default 16)
 *  - flowers: array of emoji/characters to cycle through
 *  - particleSymbol: what the burst particles look like on click
 */
const FloatingFlowers = ({
  count = 16,
  flowers = DEFAULT_FLOWERS,
  particleSymbol = "✨",
}) => {
  const containerRef = useRef(null);
  const [bursts, setBursts] = useState([]);

  const items = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    symbol: flowers[i % flowers.length],
  }));

  const handleFlowerClick = useCallback((e) => {
    const containerRect = containerRef.current.getBoundingClientRect();
    const flowerRect = e.currentTarget.getBoundingClientRect();

    const x = flowerRect.left - containerRect.left + flowerRect.width / 2;
    const y = flowerRect.top - containerRect.top + flowerRect.height / 2;

    const burstId = burstIdCounter++;
    const particleCount = 8;

    const particles = Array.from({ length: particleCount }, (_, i) => {
      const angle = (360 / particleCount) * i;
      return { pid: i, angle };
    });

    setBursts((prev) => [...prev, { burstId, x, y, particles }]);

    // Briefly hide the clicked flower, then let it respawn via CSS animation restart
    const flowerEl = e.currentTarget;
    flowerEl.classList.add("popped");
    setTimeout(() => {
      flowerEl.classList.remove("popped");
    }, 600);

    // Clean up burst particles after their animation finishes
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.burstId !== burstId));
    }, 700);
  }, []);

  return (
    <div className="floating-flowers" aria-hidden="true" ref={containerRef}>
      {items.map((item) => (
        <span
          key={item.id}
          className={`flower f${item.id}`}
          onClick={handleFlowerClick}
        >
          {item.symbol}
        </span>
      ))}

      {bursts.map((burst) => (
        <span
          key={burst.burstId}
          className="burst-origin"
          style={{ left: burst.x, top: burst.y }}
        >
          {burst.particles.map((p) => (
            <span
              key={p.pid}
              className="burst-particle"
              style={{ "--angle": `${p.angle}deg` }}
            >
              {particleSymbol}
            </span>
          ))}
        </span>
      ))}
    </div>
  );
};

export default FloatingFlowers;