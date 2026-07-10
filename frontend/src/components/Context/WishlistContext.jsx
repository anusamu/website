import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  // Load items safely from LocalStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Error parsing wishlist storage data:", e);
      }
    }
  }, []);

  const toggleWishlist = (product, showToast = true) => {
    if (!product) return;
    const productId = product._id || product.id;

    // 1. Determine if it is already added BEFORE shifting states
    const isAlreadyAdded = wishlist.some(item => (item._id || item.id) === productId);
    let updatedItems;

    if (isAlreadyAdded) {
      updatedItems = wishlist.filter(item => (item._id || item.id) !== productId);
      // 2. Fire the toast OUTSIDE of the component state updater loop safely
      if (showToast) {
        toast.info(`${product.productName || "Item"} removed from Wishlist.`);
      }
    } else {
      updatedItems = [...wishlist, product];
      if (showToast) {
        toast.success(`${product.productName || "Item"} saved to Wishlist!`);
      }
    }

    // 3. Save directly to your states
    setWishlist(updatedItems);
    localStorage.setItem("wishlist", JSON.stringify(updatedItems));
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => (item._id || item.id) === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);