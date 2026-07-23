import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../../api"; // Axios instance configured with baseURL and auth headers

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  // Fetch Cart from Backend DB
  const fetchCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCart(null);
      setCartCount(0);
      return;
    }
    try {
      const res = await api.get("/cart");
      setCart(res.data);
    } catch (err) {
      console.error("Error loading cart from server:", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Recalculate dynamic item count badge when cart updates
  useEffect(() => {
    if (cart && Array.isArray(cart.items)) {
      const totalItems = cart.items.reduce(
        (acc, item) => acc + (Number(item.quantity) || 0),
        0
      );
      setCartCount(totalItems);
    } else {
      setCartCount(0);
    }
  }, [cart]);

  // Add / Update item quantity (+1 / -1)
const addToCart = async (param1, param2, param3) => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  let productId, quantity, size;

  // Handle all call signatures: addToCart(productObj, qty, size) or addToCart(idStr, qty, size)
  if (typeof param1 === "object" && param1 !== null) {
    productId = param1._id || param1.id || param1.productId;
    quantity = typeof param2 === "number" ? param2 : param1.quantity || 1;
    size = param3 || param1.size || "Standard";
  } else {
    productId = param1;
    quantity = typeof param2 === "number" ? param2 : 1;
    size = param3 || "Standard";
  }

  // Ensure productId is extracted cleanly as a string
  const cleanProductId = typeof productId === "object" ? (productId?._id || productId?.id) : productId;

  if (!cleanProductId) {
    console.error("addToCart Error: Invalid Product ID", { param1, param2, param3 });
    return false;
  }

  try {
    const res = await api.post("/cart/add", {
      productId: String(cleanProductId),
      quantity: Number(quantity),
      size: String(size).trim(),
    });
    setCart(res.data);
    return true;
  } catch (err) {
    console.error("Error adding to cart:", err.response?.data || err.message);
    return false;
  }
};

  // Remove variant completely
 // ✅ CORRECT:
const removeFromCart = async (productId, size = "Standard") => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const res = await api.post("/cart/remove", {
      productId: String(productId),
      size: String(size).trim(),
    });
    setCart(res.data);
    return true;
  } catch (err) {
    console.error("Error removing from cart:", err.response?.data || err.message);
    return false;
  }
};
  const clearCartOnLogout = () => {
    setCart(null);
    setCartCount(0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        fetchCart,
        addToCart,
        removeFromCart,
        clearCartOnLogout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);