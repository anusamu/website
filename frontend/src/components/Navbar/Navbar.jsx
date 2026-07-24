import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  Heart,
  Menu,
  LogOut,
  Search,
  User,
  X,
} from "lucide-react";

import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Menu as MuiMenu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import { useCart } from "../Context/CartContext";
import { toast } from "react-toastify";
import "./Navbar.css";
import RajagopalLogo from '../../assets/Rajagopal handloom.png';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Dynamic live count pulled directly from context
  const { cartCount, clearCartOnLogout } = useCart();
  
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Search States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState("");
  
  const isMenuOpen = Boolean(anchorEl);

  // Derive login state safely
  const isLoggedIn = !!localStorage.getItem("token") || !!user;
  const role = user?.role?.toLowerCase();
  const isAdmin = role === "admin";

  const handleCartClick = () => {
    if (isLoggedIn) {
      navigate("/cart");
    } else {
      toast.warn("Please log in to view your shopping bag.");
      navigate("/login");
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user session metadata:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsSearchOpen(false);
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    clearCartOnLogout();
    navigate("/");
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const getLinkClass = (path) => {
    return `nav-item-link ${location.pathname === path ? "link-active" : ""}`;
  };

const executeSearch = () => {
  const query = searchInputValue.trim();
  if (query) {
    // Reuses the trimmed 'query' variable directly
    navigate(`/category-products?search=${encodeURIComponent(query)}`);
    setSearchInputValue("");
    setIsSearchOpen(false);
  }
};
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      executeSearch();
    }
  };

  return (
    <>
      <div className="nav-top-accent-line" />

      <AppBar
        position="fixed"
        elevation={0}
        className={`navbar-appbar ${isScrolled ? "nav-scrolled" : "nav-transparent"}`}
        sx={{ py: 0.5 }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justify: "space-between",
            px: { xs: 2, md: 6 },
          }}
        >      
          {/* Mobile Menu Open Trigger */}
          <Box sx={{ flex: 1, display: { xs: "block", md: "none" } }}>
            <IconButton onClick={() => setMobileOpen(true)} className="nav-icon-button">
              <Menu size={22} />
            </IconButton>
          </Box>

          <Link to="/" >
            <img 
              src={RajagopalLogo} 
              alt="Rajagopal Handloom Logo" 
              style={{ height: "50px", objectFit: "contain" }} 
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="nav-links-container">
            {isAdmin ? (
              <>
                <Link to="/admindashboard" className={getLinkClass("/admindashboard")}>Dashboard</Link>
                <Link to="/adminorders" className={getLinkClass("/adminorders")}>Orders</Link>
              </>
            ) : (
              <>
                <Link to="/" className={getLinkClass("/")}>Home</Link>
                <Link to="/shop" className={getLinkClass("/shop")}>Shop</Link>
                <Link to="/blog" className={getLinkClass("/blog")}>Blog</Link>
                <Link to="/about" className={getLinkClass("/about")}>About</Link>
                <Link to="/lookbook" className={getLinkClass("/lookbook")}>Lookbook</Link>
                {/* <Link to="/contact" className={getLinkClass("/contact")}>Contact</Link> */}
              </>
            )}
          </div>

          {/* Right Actions Tray */}
          <Box className="nav-action-tray" sx={{ gap: { xs: 0.5, md: 1.5 }, alignItems: "center" }}>
            {!isAdmin && (
              <>
                <IconButton 
                  className={`nav-icon-button ${isSearchOpen ? 'search-active' : ''}`} 
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                >
                  {isSearchOpen ? <X size={19} strokeWidth={1.5} /> : <Search size={19} strokeWidth={1.5} />}
                </IconButton>

                <IconButton className="nav-icon-button" onClick={() => navigate("/myWishlist")}>
                  <Heart size={19} strokeWidth={1.5} />
                </IconButton>

                <IconButton className="nav-icon-button" onClick={handleCartClick}>
                  <Badge badgeContent={cartCount} className="nav-badge-override">
                    <ShoppingBag size={19} strokeWidth={1.5} />
                  </Badge>
                </IconButton>
              </>
            )}

            {isLoggedIn ? (
              <>
                <IconButton onClick={handleProfileMenuOpen} size="small" sx={{ ml: 0.5 }}>
                  <Avatar
                    src={user?.avatar || ""}
                    alt={user?.firstName || "User"}
                    sx={{ width: 28, height: 28, fontSize: "0.85rem" }}
                  >
                    {user?.firstName ? user.firstName.charAt(0).toUpperCase() : "U"}
                  </Avatar>
                </IconButton>

                <MuiMenu
                  anchorEl={anchorEl}
                  open={isMenuOpen}
                  onClose={handleProfileMenuClose}
                  onClick={handleProfileMenuClose}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <MenuItem onClick={() => navigate("/profile")}>
                    <ListItemIcon><User size={16} /></ListItemIcon>
                    My Profile
                  </MenuItem>
                  <MenuItem onClick={logout}>
                    <ListItemIcon><LogOut size={16} /></ListItemIcon>
                    Logout
                  </MenuItem>
                </MuiMenu>
              </>
            ) : (
              <button onClick={() => navigate("/login")} className="nav-auth-login-btn">
                Login
              </button>
            )}
          </Box>
        </Toolbar>

        {/* SEARCH BAR DROPDOWN BAR */}
        <div className={`nav-search-popdown-container ${isSearchOpen ? "expanded" : ""}`}>
          <div className="nav-search-inner-wrapper">
            <div className="nav-search-input-field-box">
              <Search className="nav-search-inside-icon" size={18} strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search premium handlooms, categories, variants, patterns..."
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="nav-search-text-input"
              />
            </div>
            <button className="nav-search-submit-action-btn" onClick={executeSearch}>
              Search
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Drawer with Full Navigation Links */}
        <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)}>
          <Box sx={{ width: 260, p: 3, pt: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <IconButton onClick={() => setMobileOpen(false)}>
                <X size={20} />
              </IconButton>
            </Box>
            <List>
              {isAdmin ? (
                <>
                  <ListItem component={Link} to="/admindashboard" onClick={() => setMobileOpen(false)}>
                    <ListItemText primary="Dashboard" />
                  </ListItem>
                  <ListItem component={Link} to="/adminorders" onClick={() => setMobileOpen(false)}>
                    <ListItemText primary="Orders" />
                  </ListItem>
                </>
              ) : (
                <>
                  <ListItem component={Link} to="/" onClick={() => setMobileOpen(false)}>
                    <ListItemText primary="Home" />
                  </ListItem>
                  <ListItem component={Link} to="/shop" onClick={() => setMobileOpen(false)}>
                    <ListItemText primary="Shop" />
                  </ListItem>
                  <ListItem component={Link} to="/blog" onClick={() => setMobileOpen(false)}>
                    <ListItemText primary="Blog" />
                  </ListItem>
                  <ListItem component={Link} to="/about" onClick={() => setMobileOpen(false)}>
                    <ListItemText primary="About" />
                  </ListItem>
                  <ListItem component={Link} to="/lookbook" onClick={() => setMobileOpen(false)}>
                    <ListItemText primary="Lookbook" />
                  </ListItem>
                  {/* <ListItem component={Link} to="/contact" onClick={() => setMobileOpen(false)}>
                    <ListItemText primary="Contact" />
                  </ListItem> */}
                </>
              )}
            </List>
          </Box>
        </Drawer>
      </AppBar>
    </>
  );
};

export default Navbar;