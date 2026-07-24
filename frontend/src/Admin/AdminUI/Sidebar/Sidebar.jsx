import React from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";

import {
  LayoutDashboard,
  UserPlus,
  PackagePlus,
  Package,
  Pencil,
  Ban,
  MessageSquareMore,
  Users,
  Menu,
  ShoppingBag,
  CreditCard,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Palette
} from "lucide-react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Typography,
  useMediaQuery,
  useTheme,
  AppBar,
  Toolbar,
} from "@mui/material";

import "./Sidebar.css";
import RajagopalLogo from '../../../assets/Rajagopal handloom.png';

const AdminSidebar = ({
  desktopOpen,
  setDesktopOpen,
  mobileOpen,
  setMobileOpen,
  drawerWidth,
  collapsedWidth,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const adminName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const adminEmail = user.email || "";
  const adminAvatarUrl = user.avatar || "";

  const menuItems = [
    { text: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/admindashboard" },
 
    { text: "Add Product", icon: <PackagePlus size={20} />, path: "/addproduct" },
    { text: "Product List", icon: <Package size={20} />, path: "/productlist" },
    { text: "Inactive Products", icon: <Ban size={20} />, path: "/inactiveproducts" },
    { text: "Customers", icon: <Users size={20} />, path: "/customers" },
    { text: "Orders", icon: <ShoppingBag size={20} />, path: "/orders" },
    { text: "Payments", icon: <CreditCard size={20} />, path: "/payments" },
    { text: "Reports", icon: <BarChart3 size={20} />, path: "/reports" },
   { text: "Add Admin user", icon: <UserPlus size={20} />, path: "/addAdmin" },
 { text: "UI Editz", icon: <Palette size={20} />, path: "/uieditz" },
    { text: "Feedbacks", icon: <MessageSquareMore size={20} />, path: "/feedbacks" },
  ];

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopOpen(!desktopOpen);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    navigate("/", { replace: true });
  };

  const isExpanded = isMobile || desktopOpen;

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", position: "relative", overflow: "hidden" }}>
      {/* Floating Toggle Button for Desktop View */}
      {!isMobile && (
        <IconButton
          onClick={handleDrawerToggle}
          className="admin-floating-toggle-btn"
          disableRipple
        >
          {desktopOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </IconButton>
      )}

      {/* Header Profile Section - PINNED */}
      <Box
        className="admin-sidebar-header"
        sx={{
          display: "flex",
          alignItems: "center",
          flexDirection: isExpanded ? "row" : "column",
          gap: 2,
          p: 2,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            width: "100%",
            justifyContent: isExpanded ? "flex-start" : "center",
          }}
        >
          <Avatar
            src={adminAvatarUrl}
            className="admin-sidebar-avatar"
            sx={{ width: 42, height: 42 }}
          >
            {!adminAvatarUrl && adminName?.charAt(0)?.toUpperCase()}
          </Avatar>

          {isExpanded && (
            <Box className="admin-profile-text-wrapper">
              <Typography variant="subtitle2" className="admin-profile-name" sx={{ fontWeight: 600 }} noWrap>
                {adminName || "Admin"}
              </Typography>
              <Typography variant="caption" className="admin-profile-email" sx={{ color: "#777" }} noWrap>
                {adminEmail}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* SCROLLABLE CONTAINER FOR MENU ITEMS */}
      <Box className="admin-sidebar-scrollable-content" sx={{ flexGrow: 1, overflowY: "auto", px: 1.5, py: 2 }}>
        <List className="admin-sidebar-menu-list" sx={{ p: 0 }}>
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) setMobileOpen(false);
                  }}
                  className={`admin-menu-item-row ${active ? "item-active" : ""}`}
                  sx={{
                    minHeight: 46,
                    borderRadius: "8px",
                    justifyContent: isExpanded ? "initial" : "center",
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    className="admin-menu-item-icon"
                    sx={{
                      minWidth: 0,
                      mr: isExpanded ? 2 : 0,
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  {isExpanded && (
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ className: "admin-menu-item-text" }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        
        {/* Brand Logo placed inside scroll path */}
        {isExpanded && (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 2 }} className="admin-menu-item-logo">
            <RouterLink to="/">
              <img src={RajagopalLogo} alt="Rajagopal Handloom Logo" style={{ maxWidth: "100%", height: "auto" }} />
            </RouterLink>
          </Box>
        )}
      </Box>

      {/* Logout Footer Section - PINNED */}
      <Box sx={{ p: 1.5, borderTop: "1px solid #f1f3f4", flexShrink: 0, backgroundColor: "#ffffff" }}>
        <ListItemButton
          onClick={handleLogout}
          className="admin-menu-item-logout-row"
          sx={{
            minHeight: 46,
            borderRadius: "8px",
            justifyContent: isExpanded ? "initial" : "center",
            px: 2.5,
          }}
        >
          <ListItemIcon
            className="admin-menu-item-logout-icon"
            sx={{
              minWidth: 0,
              mr: isExpanded ? 2 : 0,
              justifyContent: "center",
            }}
          >
            <LogOut size={20} />
          </ListItemIcon>

          {isExpanded && (
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{ className: "admin-menu-item-logout-text" }}
            />
          )}
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {isMobile && (
        <AppBar position="fixed" className="admin-mobile-appbar" elevation={0}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, color: "#1a1a1a" }}
            >
              <Menu size={22} />
            </IconButton>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1a1a1a" }}>
              Admin Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        classes={{ paper: "admin-sidebar-drawer" }}
        sx={{
          "& .MuiDrawer-paper": {
            width: isExpanded ? drawerWidth : collapsedWidth,
            overflowX: "hidden",
            transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            backgroundColor: "#ffffff",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default AdminSidebar;