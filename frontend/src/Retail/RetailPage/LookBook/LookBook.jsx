import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Move, ExternalLink, Loader2 } from 'lucide-react';
import API from '../../../api'; // Import your configured axios instance
import './LookBook.css';
import Navbar from '../../../components/Navbar/Navbar';
import Footer from '../../../components/Footer/Footer';

// Helper to generate distributed 3D spatial coordinates for dynamic backend arrays
const generateCloudPositions = (count) => {
  const positions = [];
  const radiusX = 400;
  const radiusY = 200;

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

export default function LookBook() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeIndex, setActiveIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Fetch active products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await API.get('/products');

        if (response.data && response.data.products) {
          const fetchedItems = response.data.products;
          const layoutPositions = generateCloudPositions(fetchedItems.length);

          const mappedLooks = fetchedItems.map((prod, idx) => ({
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
            size: 'w-[210px] aspect-[3/4]'
          }));

          setProducts(mappedLooks);
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

  const handleMouseMove = (e) => {
    if (!containerRef.current || activeIndex !== null) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const isFocused = activeIndex !== null;
  const activeLook = isFocused ? products[activeIndex] : null;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="w-full h-screen bg-[#F7F1E5] flex flex-col items-center justify-center text-[#2A2118]">
          <Loader2 className="w-8 h-8 animate-spin text-[#B38738] mb-3" />
          <p className="font-serif text-sm tracking-widest uppercase text-[#B38738]">Loading Collection...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || products.length === 0) {
    return (
      <>
        <Navbar />
        <div className="w-full h-screen bg-[#F7F1E5] flex items-center justify-center text-[#2A2118]">
          <p className="font-serif text-base">{error || 'No active looks available right now.'}</p>
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
        className="lookbook-wrapper relative w-full min-h-screen bg-[#F7F1E5] text-[#2A2118] overflow-hidden font-sans select-none"
      >
        {/* Ambient Lighting Background */}
        <div 
          className="ambient-mesh absolute inset-0 pointer-events-none opacity-80 z-0"
          style={{ transform: `translate3d(${mousePos.x * -40}px, ${mousePos.y * -40}px, 0)` }}
        >
          <div className="mesh-orb orb-1 absolute top-1/4 left-1/4 w-[650px] h-[650px] bg-[#B38738]/15 rounded-full blur-[160px] pointer-events-none" />
          <div className="mesh-orb orb-2 absolute bottom-1/4 right-1/4 w-[550px] h-[550px] bg-[#7A8F78]/15 rounded-full blur-[140px] pointer-events-none" />
        </div>

        {/* 3D Stage Container */}
        <main className="relative w-full h-screen flex items-center justify-center z-10 pointer-events-none">
          <motion.div 
            className="stage-canvas relative w-full max-w-6xl h-full flex items-center justify-center pointer-events-none"
            style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
            animate={{
              rotateX: isFocused ? 0 : mousePos.y * -16,
              rotateY: isFocused ? 0 : mousePos.x * 16,
            }}
            transition={{ type: 'spring', stiffness: 45, damping: 25 }}
          >
            {products.map((look, index) => {
              const isActive = activeIndex === index;
              const isHovered = hoveredIndex === index && !isFocused;
              const isOther = isFocused && !isActive;

              // Positioning transforms for Pop-Out effect
              let targetX = isFocused ? (isActive ? -260 : look.pos.x * 2.2) : look.pos.x;
              let targetY = isFocused ? (isActive ? 0 : look.pos.y * 2.2) : look.pos.y;
              let targetZ = isFocused 
                ? (isActive ? 320 : look.pos.z - 700) 
                : (isHovered ? look.pos.z + 100 : look.pos.z);
              let targetR = isFocused ? (isActive ? 0 : look.pos.r * 2) : look.pos.r;
              let targetScale = isFocused 
                ? (isActive ? 1.4 : look.pos.s * 0.55) 
                : (isHovered ? look.pos.s * 1.15 : look.pos.s);
              let targetOpacity = isFocused ? (isActive ? 1 : 0.12) : 1;

              return (
                <motion.div
                  key={look.id}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(index);
                  }}
                  animate={{
                    x: targetX,
                    y: targetY,
                    z: targetZ,
                    scale: targetScale,
                    rotateZ: targetR,
                    opacity: targetOpacity,
                    filter: isOther ? 'blur(10px)' : 'blur(0px)'
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
                  className={`cloud-card absolute rounded-[28px] overflow-hidden shadow-2xl cursor-pointer pointer-events-auto transition-shadow duration-300 ${look.size} ${
                    isActive 
                      ? 'active-card border-[3px] border-[#B38738] ring-8 ring-[#B38738]/20 shadow-[#B38738]/30' 
                      : 'border border-white/80 hover:border-[#B38738] hover:shadow-2xl'
                  }`}
                >
                  {/* Static Inner Layer: No floating animation inside card */}
                  <div className="w-full h-full relative pointer-events-none">
                    <img 
                      src={look.img} 
                      alt={look.title}
                      className="card-image w-full h-full object-cover object-center pointer-events-none"
                    />
                    
                    <div className={`card-gradient absolute inset-0 bg-gradient-to-t from-[#2A2118]/90 via-[#2A2118]/20 to-transparent pointer-events-none transition-opacity duration-300 ${isActive || isHovered ? 'opacity-100' : 'opacity-0'}`} />

                    <div className={`card-info absolute bottom-4 left-4 right-4 text-white pointer-events-none transition-all duration-300 ${isActive || isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                      <span className="category-tag text-[9px] uppercase tracking-[0.2em] text-[#EFE6D5] font-semibold block bg-[#B38738]/90 w-max px-2.5 py-0.5 rounded-full backdrop-blur-md mb-1 pointer-events-none">
                        {look.category}
                      </span>
                      <h3 className="font-serif text-base md:text-lg text-white font-medium leading-tight pointer-events-none">
                        {look.title}
                      </h3>
                    </div>

                    {!isFocused && (
                      <div className={`hover-indicator absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 backdrop-blur-md border border-white flex items-center justify-center text-[#2A2118] pointer-events-none transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
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
                initial={{ opacity: 0, x: 80, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 75, damping: 20, delay: 0.08 }}
                onClick={(e) => e.stopPropagation()}
                className="detail-panel absolute right-6 md:right-16 top-1/2 -translate-y-1/2 z-50 w-80 md:w-96 bg-[#EFE6D5]/95 backdrop-blur-2xl border border-[#E0D3BC] p-8 rounded-[32px] shadow-2xl pointer-events-auto"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#B38738] font-bold border border-[#B38738]/30 px-3 py-1 rounded-full bg-white/60">
                    {activeLook?.category}
                  </span>
                  <button 
                    onClick={() => setActiveIndex(null)} 
                    className="p-1.5 rounded-full hover:bg-[#2A2118]/10 text-[#2A2118]/60 hover:text-[#2A2118] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <h4 className="font-serif text-3xl text-[#2A2118] mt-2 leading-tight">
                  {activeLook?.title}
                </h4>
                
                <p className="text-xs text-[#6B5E52] font-light mt-3 leading-relaxed">
                  {activeLook?.description}
                </p>
                
                <div className="mt-8 pt-6 border-t border-[#E0D3BC] flex justify-between items-end">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#6B5E52] mb-1 font-semibold">Price</p>
                    <span className="font-serif text-2xl font-bold text-[#2A2118]">{activeLook?.price}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="p-3 bg-white border border-[#E0D3BC] text-[#2A2118] rounded-full hover:bg-[#B38738] hover:text-white transition-all shadow-md">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button className="px-5 py-3 bg-[#2A2118] text-white text-xs uppercase tracking-widest rounded-full hover:bg-[#B38738] transition-all flex items-center gap-2 shadow-xl hover:shadow-[#B38738]/20">
                      <ShoppingBag className="w-4 h-4" />
                      <span>Shop Look</span>
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