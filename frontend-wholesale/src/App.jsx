import React, { useState } from 'react';
import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from 'framer-motion';

import SplashLanding from './WholesaleUI/SplashLanding/SplashLanding';
import SessionTimeout from "./components/SessionTimeout/SessionTimeout";
import Login from "./components/Login/Login";
import RegisterForm from "./components/Register/Register";

import Home from "./WholesalePage/Home/Home";
import Contact from "./WholesalePage/Contact/Contact";
import CategoryProducts from "./WholesalePage/CategoryProducts/CategoryProducts";
import ShopPage from "./WholesalePage/ShopPages/ShopPage";
import ProductDetails from "./WholesaleUI/ProductDetails/ProductDetails";
import Cart from "./WholesalePage/Cart/Cart";
import Wishlist from "./WholesalePage/Wishlist/Wishlist";
import Checkout from "./WholesalePage/Checkout/Checkout";
import LuxuryLookbook from "./WholesalePage/LookBook/LookBook";
import About from "./WholesalePage/About/About";
import Blog from "./WholesalePage/Blog/Blog";
import BlogDetail from "./WholesalePage/Blog/BlogDetail";

import './App.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      <SessionTimeout />
      <AnimatePresence>
        {showSplash && (
          <SplashLanding key="splash" onDismiss={() => setShowSplash(false)} />
        )}
      </AnimatePresence>
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterForm/>} />
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/category-products" element={<CategoryProducts/>} />
        <Route path="/shop" element={<ShopPage/>} />
        <Route path="/product/:id" element={<ProductDetails/>} />
        <Route path="/cart" element={<Cart/>} />
        <Route path="/myWishlist" element={<Wishlist/>} />
        <Route path="/checkout" element={<Checkout/>} />
        <Route path="/lookbook" element={<LuxuryLookbook/>} />
        <Route path="/about" element={<About/>} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
      </Routes>
    </>
  );
}

export default App;
