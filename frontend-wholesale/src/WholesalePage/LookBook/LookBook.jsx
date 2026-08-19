import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Loader2, ArrowUpRight } from 'lucide-react';
import API from '../../api'; 
import './LookBook.css';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

function LookBook() {
  const navigate = useNavigate();
  const [rawProducts, setRawProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const products = useMemo(() => {
    if (!rawProducts.length) return [];
    
    return rawProducts.map((prod, idx) => ({
      id: prod._id || `prod-${idx}`,
      title: prod.productName || 'Handloom Silk Saree',
      price: prod.sellingPrice 
        ? `₹${prod.sellingPrice}` 
        : prod.price 
          ? `₹${prod.price}` 
          : '₹1,940',
      category: prod.category || 'Handloom',
      description: prod.description || 'Handcrafted with authentic Kerala weave patterns.',
      img: Array.isArray(prod.images) && prod.images.length > 0 
        ? prod.images[0] 
        : (prod.imageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'),
      // Assign random tall/short aspect ratios for masonry effect
      heightClass: ['h-[300px]', 'h-[400px]', 'h-[500px]', 'h-[350px]'][idx % 4]
    }));
  }, [rawProducts]);

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
          <p className="lookbook-loading-text font-serif text-sm tracking-widest uppercase">Curating Collection...</p>
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
          <p className="font-serif text-base lookbook-error-text">{error || 'No curated looks available right now.'}</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="lookbook-wrapper">
        <div className="lookbook-header">
          <h1 className="lookbook-title">The Curated Gallery</h1>
          <p className="lookbook-subtitle">Explore our finest handloom weaves, draped in tradition and modern elegance.</p>
        </div>

        <div className="lookbook-masonry">
          {products.map((look, index) => (
            <motion.div
              key={look.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: (index % 4) * 0.1, ease: "easeOut" }}
              className={`masonry-item ${look.heightClass}`}
              onClick={() => handleViewProduct(look.id)}
            >
              <img src={look.img} alt={look.title} className="masonry-img" loading="lazy" />
              
              <div className="masonry-overlay">
                <div className="overlay-content">
                  <span className="overlay-category">{look.category}</span>
                  <h3 className="overlay-title">{look.title}</h3>
                  <p className="overlay-price">{look.price}</p>
                </div>
                
                <button className="overlay-action-btn">
                  <span className="btn-text">Shop</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default LookBook;
