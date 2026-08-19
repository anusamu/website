import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShoppingBag, X, Move, Loader2 } from 'lucide-react';
import API from '../../../api'; // Import your configured axios instance
import './LookBook.css';
import Navbar from '../../../components/Navbar/Navbar';
import Footer from '../../../components/Footer/Footer';

// Hook to detect mobile viewport
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};

// Helper to generate distributed 3D spatial coordinates
const generateCloudPositions = (count, isMobile) => {
  const positions = [];
  // Use a smaller spread radius on mobile so cards don't go off-screen
  const radiusX = isMobile ? (typeof window !== 'undefined' ? window.innerWidth * 0.35 : 180) : 400;
  const radiusY = isMobile ? (typeof window !== 'undefined' ? window.innerHeight * 0.25 : 250) : 200;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const spreadX = Math.cos(angle) * (radiusX * (0.45 + (i % 3) * 0.25));
    const spreadY = Math.sin(angle) * (radiusY * (0.45 + (i % 2) * 0.35));

    positions.push({
      x: Math.round(spreadX),
      y: Math.round(spreadY),
      z: Math.floor(Math.random() * 100) - 50,
      r: Math.floor(Math.random() * 16) - 8,
      s: parseFloat((0.85 + Math.random() * 0.2).toFixed(2))
    });
  }
  return positions;
};

function LookBook() {
  const navigate = useNavigate();
  const [rawProducts, setRawProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeIndex, setActiveIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  const containerRef = useRef(null);
  const isMobile = useIsMobile();

  // Hardware Accelerated Parallax tracking (avoids React re-renders)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth out the raw mouse values
  const smoothMouseX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  // Transforms for the ambient background
  const ambientX = useTransform(smoothMouseX, (v) => v * -40);
  const ambientY = useTransform(smoothMouseY, (v) => v * -40);

  // Transforms for the 3D stage rotation
  const rotateX = useTransform(smoothMouseY, (v) => (activeIndex !== null || isMobile ? 0 : v * -16));
  const rotateY = useTransform(smoothMouseX, (v) => (activeIndex !== null || isMobile ? 0 : v * 16));

  // Fetch active products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await API.get('/products');

        if (response.data && response.data.products) {
          setRawProducts(response.data.products);
        }
      } catch (err) {
        console.error('Failed to fetch lookbook products:', err);
        setError('Unable to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Compute mapped looks and positions dynamically based on mobile state
  const products = useMemo(() => {
    if (!rawProducts.length) return [];
    
    const layoutPositions = generateCloudPositions(rawProducts.length, isMobile);

    return rawProducts.map((prod, idx) => ({
      id: prod._id || `prod-${idx}`,
      title: prod.productName || 'Handloom Silk Saree',
      price: prod.sellingPrice 
        ? `₹${prod.sellingPrice}` 
        : prod.price 
          ? `₹${prod.price}` 
          : '₹1,940',
      category: prod.category || 'Handloom',
      description: prod.description || 'Handcrafted with authentic Kerala weave patterns. Features pure natural fibers, hand-dyed tones, and traditional zari work.',
      img: Array.isArray(prod.images) && prod.images.length > 0 
        ? prod.images[0] 
        : (prod.imageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'),
      pos: layoutPositions[idx] || { x: 0, y: 0, z: 0, r: 0, s: 1 },
      size: isMobile ? 'w-[160px] aspect-[3/4]' : 'w-[210px] aspect-[3/4]'
    }));
  }, [rawProducts, isMobile]);

  const handleMouseMove = (e) => {
    // Update motion values directly without triggering a React re-render
    if (!containerRef.current || activeIndex !== null || isMobile) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const isFocused = activeIndex !== null;
  const activeLook = isFocused ? products[activeIndex] : null;

  const handleViewProduct = (productId) => {
    if (productId) {
      navigate(`/product/${productId}`);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="lookbook-loading w-full h-screen flex flex-col items-center justify-center">
          <Loader2 className="lookbook-spinner w-8 h-8 animate-spin mb-3" />
          <p className="lookbook-loading-text font-serif text-sm tracking-widest uppercase">Loading Collection...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || products.length === 0) {
    return (
      <>
        <Navbar />
        <div className="lookbook-loading w-full h-screen flex items-center justify-center">
          <p className="font-serif text-base lookbook-error-text">{error || 'No active looks available right now.'}</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onClick={() => {
          if (isFocused) setActiveIndex(null);
        }}
        className="lookbook-wrapper relative w-full min-h-screen overflow-hidden font-sans select-none"
      >
        {/* Responsive, Neat Title Header */}
        <div className="absolute top-20 md:top-28 left-0 w-full z-40 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <h1 className="font-serif text-3xl md:text-5xl text-gray-800 tracking-wider mb-2" style={{ textShadow: '0 2px 10px rgba(255,255,255,0.8)' }}>
            Rajagopal Handloom
          </h1>
          <p className="font-sans text-[10px] md:text-xs text-gray-600 uppercase tracking-[0.3em]" style={{ textShadow: '0 1px 5px rgba(255,255,255,0.8)' }}>
            The Signature Look Book
          </p>
        </div>

        {/* Ambient Lighting Background */}
        <motion.div 
          className="ambient-mesh absolute inset-0 pointer-events-none opacity-80 z-0"
          style={{ x: isMobile ? 0 : ambientX, y: isMobile ? 0 : ambientY }}
        >
          <div className="mesh-orb orb-1 absolute top-1/4 left-1/4 w-[400px] md:w-[650px] h-[400px] md:h-[650px] rounded-full blur-[100px] md:blur-[160px] pointer-events-none" />
          <div className="mesh-orb orb-2 absolute bottom-1/4 right-1/4 w-[300px] md:w-[550px] h-[300px] md:h-[550px] rounded-full blur-[80px] md:blur-[140px] pointer-events-none" />
        </motion.div>

        {/* 3D Stage Container */}
        <main className="relative w-full h-screen flex items-center justify-center z-10 pointer-events-none">
          <motion.div 
            className="stage-canvas relative w-full max-w-6xl h-full flex items-center justify-center pointer-events-none mt-16 md:mt-0"
            style={{ 
              perspective: isMobile ? 800 : 1200, 
              transformStyle: 'preserve-3d',
              rotateX,
              rotateY
            }}
          >
            {products.map((look, index) => {
              const isActive = activeIndex === index;
              const isHovered = hoveredIndex === index && !isFocused;
              const isOther = isFocused && !isActive;

              // Positioning transforms for Pop-Out effect
              let targetX = isFocused ? (isActive ? (isMobile ? 0 : -260) : look.pos.x * 2.2) : look.pos.x;
              let targetY = isFocused ? (isActive ? (isMobile ? -140 : 0) : look.pos.y * 2.2) : look.pos.y;
              let targetZ = isFocused 
                ? (isActive ? (isMobile ? 150 : 320) : look.pos.z - 700) 
                : (isHovered ? look.pos.z + (isMobile ? 50 : 100) : look.pos.z);
              let targetR = isFocused ? (isActive ? 0 : look.pos.r * 2) : look.pos.r;
              let targetScale = isFocused 
                ? (isActive ? (isMobile ? 1.25 : 1.4) : look.pos.s * 0.55) 
                : (isHovered ? look.pos.s * 1.15 : look.pos.s);
              let targetOpacity = isFocused ? (isActive ? 1 : 0.12) : 1;

              // Only show card info on desktop hover OR when card is clicked/active
              const showCardInfo = isActive || (isHovered && !isMobile);

              return (
                <motion.div
                  key={look.id}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(index === activeIndex ? null : index);
                  }}
                  animate={{
                    x: targetX,
                    y: targetY,
                    z: targetZ,
                    scale: targetScale,
                    rotateZ: targetR,
                    opacity: targetOpacity,
                    filter: isOther ? 'blur(4px)' : 'blur(0px)'
                  }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: isActive ? 70 : 40,
                    damping: isActive ? 20 : 22, 
                    mass: 0.85
                  }}
                  style={{ 
                    transformStyle: 'preserve-3d',
                    zIndex: isActive ? 999 : (isHovered ? 500 : Math.floor(look.pos.z + 500))
                  }}
                  className={`cloud-card absolute rounded-[24px] md:rounded-[28px] overflow-hidden shadow-2xl cursor-pointer pointer-events-auto transition-shadow duration-300 ${look.size} ${
                    isActive 
                      ? 'active-card cloud-card--active' 
                      : 'cloud-card--idle'
                  }`}
                >
                  <div className="w-full h-full relative pointer-events-none">
                    <img 
                      src={look.img} 
                      alt={look.title}
                      className="card-image w-full h-full object-cover object-center pointer-events-none"
                    />
                    
                    <div className={`card-gradient absolute inset-0 pointer-events-none transition-opacity duration-300 ${showCardInfo ? 'opacity-100' : 'opacity-0'}`} />

                    <div className={`card-info absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4 text-white pointer-events-none transition-all duration-300 ${showCardInfo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                      <span className="category-tag text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-semibold block w-max px-2 py-0.5 md:px-2.5 md:py-0.5 rounded-full backdrop-blur-md mb-1 pointer-events-none">
                        {look.category}
                      </span>
                      <h3 className="font-serif text-sm md:text-lg text-white font-medium leading-tight pointer-events-none">
                        {look.title}
                      </h3>
                    </div>

                    {(!isFocused && !isMobile) && (
                      <div className={`hover-indicator absolute top-3 right-3 w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center pointer-events-none transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                        <Move className="w-3.5 h-3.5 pointer-events-none" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Detail Inspection Panel */}
          <AnimatePresence>
            {isFocused && (
              <motion.div
                initial={isMobile ? { opacity: 0, y: 40, x: '-50%', scale: 0.95 } : { opacity: 0, x: 80, y: '-50%', scale: 0.95 }}
                animate={isMobile ? { opacity: 1, y: 0, x: '-50%', scale: 1 } : { opacity: 1, x: 0, y: '-50%', scale: 1 }}
                exit={isMobile ? { opacity: 0, y: 40, x: '-50%', scale: 0.95 } : { opacity: 0, x: 80, y: '-50%', scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 75, damping: 20, delay: 0.08 }}
                onClick={(e) => e.stopPropagation()}
                className={`detail-panel absolute z-50 p-6 md:p-8 rounded-[24px] md:rounded-[32px] shadow-2xl pointer-events-auto ${
                  isMobile 
                    ? 'bottom-10 left-1/2 w-[92%] max-w-md' 
                    : 'right-6 md:right-16 top-1/2 w-80 md:w-96'
                }`}
              >
                <div className="flex justify-between items-center mb-3 md:mb-4">
                  <span className="detail-panel-category">
                    {activeLook?.category}
                  </span>
                  <button 
                    onClick={() => setActiveIndex(null)} 
                    className="detail-panel-close-btn p-1.5 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
                
                <h4 className="detail-panel-title font-serif text-2xl md:text-3xl mt-1 md:mt-2 leading-tight">
                  {activeLook?.title}
                </h4>
                
                <p className="detail-panel-desc text-[11px] md:text-xs font-light mt-2 md:mt-3 leading-relaxed">
                  {activeLook?.description}
                </p>
                
                <div className="detail-panel-footer mt-5 md:mt-8 pt-4 md:pt-6 flex justify-between items-end">
                  <div>
                    <p className="detail-panel-price-label text-[9px] md:text-[10px] uppercase tracking-widest mb-1 font-semibold">Price</p>
                    <span className="detail-panel-price font-serif text-xl md:text-2xl font-bold">{activeLook?.price}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleViewProduct(activeLook?.id)}
                      className="detail-panel-btn-shop px-4 md:px-5 py-2.5 md:py-3 text-[10px] md:text-xs uppercase tracking-widest rounded-full transition-all flex items-center gap-2 shadow-xl cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      <Footer />
    </>
  );
}

export default LookBook;