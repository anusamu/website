import React, { useState } from 'react';
import { 
  Users, 
  ShoppingBag, 
  BarChart3, 
  Menu, 
  Bell,
  Search
} from 'lucide-react';
import { Box, Toolbar } from "@mui/material";
import Navbar from '../../components/Navbar/Navbar'
import AdminSidebar from '../AdminUI/Sidebar/Sidebar';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const stats = [
    { title: 'Total Revenue', value: '$45,231.89', change: '+20.1%', isPositive: true, icon: ShoppingBag },
    { title: 'Active Users', value: '+2,350', change: '+180.1%', isPositive: true, icon: Users },
    { title: 'Sales Performance', value: '+12,234', change: '-4.3%', isPositive: false, icon: BarChart3 },
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'Sarah Connor', Product: 'Cyberdyne CPU', amount: '$1,200.00', status: 'Paid' },
    { id: 'ORD-002', customer: 'John Doe', Product: 'Leather Jacket', amount: '$250.00', status: 'Pending' },
    { id: 'ORD-003', customer: 'Ellen Ripley', Product: 'Power Loader', amount: '$18,500.00', status: 'Shipped' },
    { id: 'ORD-004', customer: 'Bruce Wayne', Product: 'Graphite Cowl', amount: '$5,400.00', status: 'Paid' },
  ];

  return (
    <>
      
      
      <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#fdfbf7" }}>
        {/* Sidebar Component */}
      <h1>hello dashboard</h1>
        
        {/* Main Content Display View Area */}
        {/*  */}
      </Box>
    </>
  );
};

export default Dashboard;