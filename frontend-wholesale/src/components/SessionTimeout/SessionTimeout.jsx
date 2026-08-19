import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../Context/CartContext';
import { useWishlist } from '../Context/WishlistContext';

const SessionTimeout = () => {
  const navigate = useNavigate();
  const { clearCartOnLogout } = useCart();
  const { clearWishlistOnLogout } = useWishlist();
  
  const timeoutIdRef = useRef(null);

  const TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  const logout = () => {
    const token = localStorage.getItem("token");
    if (!token) return; // Already logged out

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    clearCartOnLogout();
    clearWishlistOnLogout();
    
    // Dispatch a custom event so other components (like Navbar) know the user has logged out
    window.dispatchEvent(new Event('authChange'));
    
    toast.info("Session expired due to inactivity. Please log in again.");
    navigate("/login");
  };

  const resetTimer = () => {
    // Only reset timer if user is logged in
    const token = localStorage.getItem("token");
    
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    
    if (token) {
      timeoutIdRef.current = setTimeout(logout, TIMEOUT_DURATION);
    }
  };

  useEffect(() => {
    // Initial setup
    resetTimer();

    // Events that count as "activity"
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

    // Throttle the activity handler slightly to improve performance
    let throttleTimeout = null;
    const handleActivity = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          resetTimer();
          throttleTimeout = null;
        }, 1000); // Only reset timer at most once per second
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Listen to custom authChange event to start/stop tracking based on login state
    const handleAuthChange = () => {
      resetTimer();
    };
    window.addEventListener('authChange', handleAuthChange);
    // Also listen to storage events in case of login/logout in another tab
    window.addEventListener('storage', handleAuthChange);

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default SessionTimeout;
