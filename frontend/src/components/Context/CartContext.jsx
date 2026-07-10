import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../../api"; 

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const token = localStorage.getItem("token");

  // Fetch Cart from Backend DB
  const fetchCart = async () => {
    if (!localStorage.getItem("token")) {
      setCart(null);
      setCartCount(0);
      return;
    }
    try {
      const res = await api.get("/cart");
      setCart(res.data);
    } catch (err) {
      console.error("Error loading cart details from server", err);
    }
  };

  // Recalculate dynamic item quantities every time cart state modifications occur
  useEffect(() => {
    if (cart && cart.items) {
      const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(totalItems);
    } else {
      setCartCount(0);
    }
  }, [cart]);

  // Sync cart automatically on app boot up if user is logged in
  useEffect(() => {
    fetchCart();
  }, [token]);

  // Dispatch API Call: Add or increment items
  const addToCart = async (product, quantity = 1) => {
    if (!localStorage.getItem("token")) return false;
    try {
      const res = await api.post("/cart/add", { productId: product._id, quantity });
      setCart(res.data); // Directly updates state, reflecting across Navbar badge immediately
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Dispatch API Call: Delete item
  const removeFromCart = async (productId) => {
    try {
      const res = await api.delete(`/cart/remove/${productId}`);
      setCart(res.data); // Dynamic live recalculation triggers instantly
    } catch (err) {
      console.error(err);
    }
  };

  const clearCartOnLogout = () => {
    setCart(null);
    setCartCount(0);
  };

  return (
    <CartContext.Provider value={{ cart, cartCount, fetchCart, addToCart, removeFromCart, clearCartOnLogout }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);