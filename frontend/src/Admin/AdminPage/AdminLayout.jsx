import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import AdminSidebar from "../AdminUI/Sidebar/Sidebar";

const AdminLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawerWidth = 260;
  const collapsedWidth = 80;

  // Calculate the current active sidebar width based on system state
  const currentSidebarWidth = isMobile 
    ? 0 
    : (desktopOpen ? drawerWidth : collapsedWidth);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", width: "100vw", overflowX: "hidden" }}>
      {/* Sidebar Navigation */}
      <AdminSidebar 
        desktopOpen={desktopOpen} 
        setDesktopOpen={setDesktopOpen}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        drawerWidth={drawerWidth}
        collapsedWidth={collapsedWidth}
      />

      {/* Main Page View Window */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          boxSizing: "border-box",
          
          // CRITICAL FIXES: 
          // 1. Force the page width to adapt dynamically to remaining space
          width: { xs: "100%", md: `calc(100% - ${currentSidebarWidth}px)` },
          
          // 2. Physically push the container away from underneath the fixed sidebar layout
          marginLeft: { xs: 0, md: `${currentSidebarWidth}px` },
          
          // 3. Smooth transition styling applied to both dimensions simultaneously
          transition: theme.transitions.create(["margin-left", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          
          // Safe boundary clearing header height spacing for mobile screens
          mt: { xs: "60px", md: 0 }, 
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
        }}
      >
        <Outlet /> 
      </Box>
    </Box>
  );
};

export default AdminLayout;