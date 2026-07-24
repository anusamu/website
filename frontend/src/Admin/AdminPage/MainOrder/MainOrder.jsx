// MainOrder.jsx
import React, { useState, useEffect } from 'react';
import API from '../../../api'; 
import RetailOrder from '../../AdminUI/RetailOrder/RetailOrder';
import WholesaleOrder from '../../AdminUI/WholesaleOrder/WholesaleOrder';

import { Button, Chip } from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import SearchIcon from '@mui/icons-material/Search';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';

import './MainOrder.css';

export default function MainOrder() {
  const [activeTab, setActiveTab] = useState('retail'); // 'retail' | 'wholesale'
  const [statusFilter, setStatusFilter] = useState('All');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch orders based on active tab
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'retail' 
        ? '/admin/orders/retail' 
        : '/admin/orders/wholesale';

      const { data } = await API.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    setStatusFilter('All');
  }, [activeTab]);

  // Counts calculation
  const counts = {
    all: orders.length,
    received: orders.filter(o => o.status === 'Paid').length,
    packing: orders.filter(o => o.status === 'Packing').length,
    shipped: orders.filter(o => o.status === 'Shipped').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
  };

  // Filter orders
  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'All' && o.status !== statusFilter) return false;

    const term = searchTerm.toLowerCase();
    const name = `${o.shippingAddress?.firstName || ''} ${o.shippingAddress?.lastName || ''}`.toLowerCase();
    const paymentId = o.paymentId?.toLowerCase() || '';
    const phone = o.shippingAddress?.phone || '';
    const itemNames = o.items?.map(i => (i.product?.productName|| i.name || '').toLowerCase()).join(' ') || '';

    return name.includes(term) || paymentId.includes(term) || phone.includes(term) || itemNames.includes(term);
  });

  return (
    <div className="main-orders-wrapper">
      {/* Header & Search */}
      <div className="main-orders-header">
        <div>
          <h1 className="main-orders-title">Orders Management</h1>
          <p className="main-orders-subtitle">Track and fulfill retail & wholesale purchases</p>
        </div>

        <div className="search-input-box">
          <div className="search-icon-wrapper">
            <SearchIcon fontSize="small" />
          </div>
          <input
            type="text"
            placeholder="Search name, phone, or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-field"
          />
        </div>
      </div>

      {/* Main Tab Bar (Styled with Light Green Theme) */}
      <div className="orders-toggle-container">
        {/* Retail Button */}
        <Button
          disableRipple
          onClick={() => setActiveTab('retail')}
          className={`toggle-tab-btn ${activeTab === 'retail' ? 'active-tab' : ''}`}
          sx={{
            flex: 1,
            py: '16px',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            color: activeTab === 'retail' ? '#15803d !important' : '#4b5563 !important',
            backgroundColor: activeTab === 'retail' ? '#f0fdf4 !important' : '#ffffff !important',
            borderBottom: activeTab === 'retail' ? '3px solid #22c55e !important' : '3px solid transparent !important',
          }}
        >
          <ShoppingCartOutlinedIcon 
            fontSize="medium" 
            sx={{ color: activeTab === 'retail' ? '#16a34a !important' : '#9ca3af !important', mr: 1 }} 
          />
          <span>Retail Orders</span>
          <Chip 
            label={activeTab === 'retail' ? orders.length : 0} 
            size="small" 
            sx={{
              ml: 1.5,
              height: '22px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: activeTab === 'retail' ? '#dcfce7 !important' : '#f3f4f6 !important',
              color: activeTab === 'retail' ? '#14532d !important' : '#6b7280 !important',
            }}
          />
        </Button>

        <div className="toggle-tab-divider" />

        {/* Wholesale Button */}
        <Button
          disableRipple
          onClick={() => setActiveTab('wholesale')}
          className={`toggle-tab-btn ${activeTab === 'wholesale' ? 'active-tab' : ''}`}
          sx={{
            flex: 1,
            py: '16px',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            color: activeTab === 'wholesale' ? '#15803d !important' : '#4b5563 !important',
            backgroundColor: activeTab === 'wholesale' ? '#f0fdf4 !important' : '#ffffff !important',
            borderBottom: activeTab === 'wholesale' ? '3px solid #22c55e !important' : '3px solid transparent !important',
          }}
        >
          <StorefrontOutlinedIcon 
            fontSize="medium" 
            sx={{ color: activeTab === 'wholesale' ? '#16a34a !important' : '#9ca3af !important', mr: 1 }} 
          />
          <span>Wholesale Orders</span>
          <Chip 
            label={activeTab === 'wholesale' ? orders.length : 0} 
            size="small" 
            sx={{
              ml: 1.5,
              height: '22px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: activeTab === 'wholesale' ? '#dcfce7 !important' : '#f3f4f6 !important',
              color: activeTab === 'wholesale' ? '#14532d !important' : '#6b7280 !important',
            }}
          />
        </Button>
      </div>

      {/* Filter Cards */}
      <div className="status-cards-grid">
        <div onClick={() => setStatusFilter('All')} className={`status-card ${statusFilter === 'All' ? 'card-all-active' : ''}`}>
          <div>
            <p className="card-label">Total</p>
            <p className="card-count">{counts.all}</p>
          </div>
          <span className="card-tag">All</span>
        </div>

        <div onClick={() => setStatusFilter('Paid')} className={`status-card ${statusFilter === 'Paid' ? 'card-paid-active' : ''}`}>
          <div className="card-icon-group">
            <InboxOutlinedIcon fontSize="small" />
            <div>
              <p className="card-label">Received</p>
              <p className="card-count">{counts.received}</p>
            </div>
          </div>
        </div>

        <div onClick={() => setStatusFilter('Packing')} className={`status-card ${statusFilter === 'Packing' ? 'card-packing-active' : ''}`}>
          <div className="card-icon-group">
            <Inventory2OutlinedIcon fontSize="small" />
            <div>
              <p className="card-label">Packing</p>
              <p className="card-count">{counts.packing}</p>
            </div>
          </div>
        </div>

        <div onClick={() => setStatusFilter('Shipped')} className={`status-card ${statusFilter === 'Shipped' ? 'card-shipped-active' : ''}`}>
          <div className="card-icon-group">
            <LocalShippingOutlinedIcon fontSize="small" />
            <div>
              <p className="card-label">Shipped</p>
              <p className="card-count">{counts.shipped}</p>
            </div>
          </div>
        </div>

        <div onClick={() => setStatusFilter('Delivered')} className={`status-card ${statusFilter === 'Delivered' ? 'card-delivered-active' : ''}`}>
          <div className="card-icon-group">
            <CheckCircleOutlinedIcon fontSize="small" />
            <div>
              <p className="card-label">Delivered</p>
              <p className="card-count">{counts.delivered}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Render Component dynamically */}
      {activeTab === 'retail' ? (
        <RetailOrder 
          orders={filteredOrders} 
          setOrders={setOrders} 
          loading={loading} 
          statusFilter={statusFilter} 
        />
      ) : (
        <WholesaleOrder 
          orders={filteredOrders} 
          setOrders={setOrders} 
          loading={loading} 
          statusFilter={statusFilter} 
        />
      )}
    </div>
  );
}