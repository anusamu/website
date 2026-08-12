import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../api"; // Axios instance configured with baseURL and auth headers

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setWishlist([]);
      return;
    }
    try {
      const res = await api.get("/wishlist", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(res.data?.items || []);
    } catch (err) {
      console.error("Error loading wishlist from server:", err);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const toggleWishlist = async (product, showToast = true) => {
    if (!product) return;
    const token = localStorage.getItem("token");
    if (!token) {
      if (showToast) {
        toast.error("Please login to manage your wishlist.");
      }
      return;
    }

    const productId = product._id || product.id;
    const isAlreadyAdded = wishlist.some((item) => (item._id || item.id) === productId);

    try {
      if (isAlreadyAdded) {
        const res = await api.post("/wishlist/remove", { productId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWishlist(res.data?.items || []);
        if (showToast) {
          toast.info(`${product.productName || "Item"} removed from Wishlist.`);
        }
      } else {
        const res = await api.post("/wishlist/add", { productId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWishlist(res.data?.items || []);
        if (showToast) {
          toast.success(`${product.productName || "Item"} saved to Wishlist!`);
        }
      }
    } catch (err) {
      console.error("Error toggling wishlist:", err);
      toast.error("Failed to update wishlist.");
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item._id || item.id) === productId);
  };

  const clearWishlistOnLogout = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, toggleWishlist, isInWishlist, fetchWishlist, clearWishlistOnLogout }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);