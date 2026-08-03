import React, { useState, useEffect } from 'react';
import { 
  Users, ShoppingBag, Package, Truck, 
  AlertCircle, Archive, Mail, Bell, Search, 
  TrendingUp, ArrowUpRight, ArrowDownRight,
  Loader2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import api from '../../../api';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('retail');
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wholesaleOrders, setWholesaleOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes, wholesaleRes] = await Promise.all([
        api.get('/products/admin/all'),
        api.get('/admin/orders/retail'),
        api.get('/admin/orders/wholesale')
      ]);
      
      if (productsRes.data) {
        setProducts(productsRes.data);
      }
      
      if (ordersRes.data && ordersRes.data.orders) {
        setOrders(ordersRes.data.orders);
      }
      
      if (wholesaleRes.data && wholesaleRes.data.orders) {
        setWholesaleOrders(wholesaleRes.data.orders);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Calculate Retail Metrics
  // -------------------------------------------------------------
  const totalOrders = orders.length;
  const shippedOrders = orders.filter(o => o.status === 'Shipped').length;
  const ordersReceived = orders.filter(o => ['Paid', 'Pending', 'Processing'].includes(o.status)).length;
  const outOfStockProducts = products.filter(p => p.stockStatus === 'Out Of Stock' || p.stockCount <= 0).length;
  const inactiveProducts = products.filter(p => p.status === 'inactive').length;
  const enquiriesCount = 0; // Future feature as requested

  // Notification Counts for new/recent orders
  const retailNewOrders = orders.filter(o => o.status === 'Paid' || o.status === 'Pending').length;
  const wholesaleNewOrders = wholesaleOrders.filter(o => o.status === 'Paid' || o.status === 'Pending').length;

  const retailStats = [
    { title: 'Total Orders', value: totalOrders.toString(), change: '+12.5%', isPositive: true, icon: ShoppingBag, color: '#3b82f6' },
    { title: 'Shipped', value: shippedOrders.toString(), change: '+5.2%', isPositive: true, icon: Truck, color: '#10b981' },
    { title: 'Order Received', value: ordersReceived.toString(), change: '+2.1%', isPositive: true, icon: Package, color: '#8b5cf6' },
    { title: 'Out of Stock', value: outOfStockProducts.toString(), change: '-1.5%', isPositive: false, icon: AlertCircle, color: '#ef4444' },
    { title: 'Inactive Products', value: inactiveProducts.toString(), change: '0%', isPositive: true, icon: Archive, color: '#6b7280' },
    { title: 'Enquiries', value: enquiriesCount.toString(), change: '0%', isPositive: true, icon: Mail, color: '#f59e0b' },
  ];

  // -------------------------------------------------------------
  // Calculate Line Chart Data (Sales by Month)
  // -------------------------------------------------------------
  const calculateMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyStats = months.map(m => ({ name: m, sales: 0, orders: 0 }));

    orders.forEach(order => {
      const date = new Date(order.createdAt);
      if (!isNaN(date.getTime())) {
        const monthIndex = date.getMonth();
        monthlyStats[monthIndex].sales += (order.totalAmount || 0);
        monthlyStats[monthIndex].orders += 1;
      }
    });

    const currentMonth = new Date().getMonth();
    let startIndex = currentMonth - 6;
    if (startIndex < 0) startIndex = 0;
    return monthlyStats.slice(startIndex, currentMonth + 1);
  };

  const salesData = orders.length > 0 ? calculateMonthlyData() : [
    { name: 'Jan', sales: 0, orders: 0 },
    { name: 'Feb', sales: 0, orders: 0 },
  ];

  // -------------------------------------------------------------
  // Calculate Pie Chart Data (Order Status)
  // -------------------------------------------------------------
  const calculateStatusDistribution = () => {
    const statusCounts = {};
    orders.forEach(order => {
      const st = order.status || 'Pending';
      statusCounts[st] = (statusCounts[st] || 0) + 1;
    });

    const colors = {
      'Paid': '#3b82f6',
      'Processing': '#8b5cf6',
      'Shipped': '#10b981',
      'Delivered': '#14b8a6',
      'Pending': '#f59e0b',
      'Cancelled': '#ef4444'
    };

    return Object.keys(statusCounts).map(key => ({
      name: key,
      value: statusCounts[key],
      color: colors[key] || '#6b7280' // default color
    }));
  };

  const orderStatusData = calculateStatusDistribution();
  // Ensure we show something if no data exists
  const displayOrderStatusData = orderStatusData.length > 0 ? orderStatusData : [{name: 'No Data', value: 1, color: '#e2e8f0'}];


  // -------------------------------------------------------------
  // Calculate Recent Products Data
  // -------------------------------------------------------------
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(p => ({
      id: p._id,
      name: p.productName || p.name || 'Unnamed Product',
      stock: p.stockCount || 0,
      status: p.status === 'active' ? (p.stockCount > 0 ? 'Active' : 'Out of Stock') : 'Inactive',
      price: `₹${p.price || 0}`
    }));


  if (loading) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
        <Loader2 className="animate-spin" size={48} color="#3b82f6" />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h1 className="dashboard-title">Analytics Overview</h1>
          <p className="dashboard-subtitle">Monitor your business metrics and performance</p>
        </div>
        <div className="dashboard-actions">
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input type="text" placeholder="Search..." />
          </div>
          <button className="notification-btn">
            <Bell size={22} />
            <span className="notification-badge">3</span>
          </button>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'retail' ? 'active' : ''}`}
          onClick={() => setActiveTab('retail')}
        >
          Retail Analytics
          {retailNewOrders > 0 && <span className="tab-badge">{retailNewOrders}</span>}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'wholesale' ? 'active' : ''}`}
          onClick={() => setActiveTab('wholesale')}
        >
          Wholesale Analytics
          {wholesaleNewOrders > 0 && <span className="tab-badge">{wholesaleNewOrders}</span>}
        </button>
      </div>

      {activeTab === 'retail' ? (
        <div className="dashboard-content animate-fade-in">
          {/* Stats Grid */}
          <div className="stats-grid">
            {retailStats.map((stat, index) => (
              <div className="stat-card" key={index}>
                <div className="stat-card-header">
                  <div className="stat-icon-wrapper" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                    <stat.icon size={24} />
                  </div>
                  <div className={`stat-change ${stat.isPositive ? 'positive' : 'negative'}`}>
                    {stat.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    <span>{stat.change}</span>
                  </div>
                </div>
                <div className="stat-card-body">
                  <h3 className="stat-value">{stat.value}</h3>
                  <p className="stat-title">{stat.title}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="charts-grid">
            <div className="chart-card main-chart">
              <div className="chart-header">
                <h3>Revenue & Orders Trend</h3>
                <select className="chart-select">
                  <option>Last 7 Months</option>
                  <option>This Year</option>
                </select>
              </div>
              <div className="chart-body">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 8}} />
                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card side-chart">
              <div className="chart-header">
                <h3>Order Status Distribution</h3>
              </div>
              <div className="chart-body pie-chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={displayOrderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {displayOrderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pie-legend">
                  {orderStatusData.map((item, index) => (
                    <div className="legend-item" key={index}>
                      <span className="legend-dot" style={{backgroundColor: item.color}}></span>
                      <span className="legend-label">{item.name} ({item.value})</span>
                    </div>
                  ))}
                  {orderStatusData.length === 0 && (
                     <div className="legend-item">
                      <span className="legend-dot" style={{backgroundColor: '#e2e8f0'}}></span>
                      <span className="legend-label">No Orders Yet</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tables Section */}
          <div className="tables-section">
            <div className="table-card">
              <div className="table-header">
                <h3>Recent Product Status</h3>
                <button className="view-all-btn">View All</button>
              </div>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProducts.length > 0 ? (
                      recentProducts.map(product => (
                        <tr key={product.id}>
                          <td className="product-name">{product.name}</td>
                          <td>{product.price}</td>
                          <td>
                            <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                              {product.stock} units
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${product.status.toLowerCase().replace(/ /g, '-')}`}>
                              {product.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: '#64748b', padding: '30px' }}>
                          No products found in database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="wholesale-placeholder animate-fade-in">
          <div className="placeholder-content">
            <TrendingUp size={48} className="placeholder-icon" />
            <h2>Wholesale Analytics Coming Soon</h2>
            <p>Detailed insights and metrics for your wholesale operations will be available here.</p>
            <button className="notify-btn">Notify Me When Available</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
