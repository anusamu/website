// WholesaleOrder.jsx
import React, { useState } from 'react';
import API from '../../../api';
import { toast } from 'react-toastify';
import { Select, MenuItem, FormControl } from '@mui/material';
import { Truck, ExternalLink } from 'lucide-react';
import ShippingModal from '../ShippingModal/ShippingModal';

import './WholesaleOrder.css';

const STATUS_OPTIONS = [
  { value: 'Paid', label: 'Order Received', color: '#16a34a', bg: '#f0fdf4' },
  { value: 'Packing', label: 'Packing', color: '#d97706', bg: '#fffbeb' },
  { value: 'Shipped', label: 'Shipped', color: '#0284c7', bg: '#f0f9ff' },
  { value: 'Delivered', label: 'Delivered', color: '#059669', bg: '#ecfdf5' },
];

export default function WholesaleOrder({ orders, setOrders, loading, statusFilter }) {
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleStatusSelect = async (order, newStatus) => {
    // If admin is selecting 'Shipped', open the Shipping Modal with tracking fields & email trigger
    if (newStatus === 'Shipped') {
      setSelectedOrder(order);
      setShippingModalOpen(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const { data } = await API.put(
        `/admin/update-status/${order._id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(`Wholesale Order status updated to ${newStatus === 'Paid' ? 'Order Received' : newStatus}`);
        setOrders(prev =>
          prev.map(o => (o._id === order._id ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const handleOpenTrackingModal = (order) => {
    setSelectedOrder(order);
    setShippingModalOpen(true);
  };

  const handleShippingModalSuccess = (updatedOrder) => {
    setOrders(prev =>
      prev.map(o => (o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o))
    );
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case 'Paid': return 'ws-badge-paid';
      case 'Packing': return 'ws-badge-packing';
      case 'Shipped': return 'ws-badge-shipped';
      case 'Delivered': return 'ws-badge-delivered';
      default: return 'ws-badge-default';
    }
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="ws-spinner"></div>
        <p>Loading wholesale orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-empty">
        <p className="empty-title">No wholesale orders found</p>
        <p className="empty-sub">Bulk business orders placed will appear here.</p>
      </div>
    );
  }

  return (
    <div className="ws-table-container">
      <div className="table-tag wholesale-tag">Wholesale Bulk Orders List</div>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Product & Wholesale Price</th>
            <th>Bulk Size & Qty</th>
            <th>Business / Buyer Details</th>
            <th>Payment Info</th>
            <th>Total Amount</th>
            <th>Status & Tracking</th>
            <th>Operations</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              {/* Product */}
              <td>
                <div className="product-column">
                  {order.items?.map((item, idx) => {
                    const prodObj = item.product || {};
                    const prodName = prodObj.productName || prodObj.name || prodObj.title || item.productName || item.name || item.title || 'Product';
                    const prodImg = prodObj.images?.[0] || prodObj.image || item.image || 'https://via.placeholder.com/60';
                    const unitPrice = item.price || prodObj.wholesalePrice || prodObj.price || 0;

                    return (
                      <div key={idx} className="product-item">
                        <img src={prodImg} alt={prodName} className="product-img" />
                        <div>
                          <p className="product-title">{prodName}</p>
                          <div className="price-tag-wrap">
                            <span className="ws-price-tag">₹{unitPrice.toLocaleString('en-IN')} / unit</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </td>

              {/* Size & Qty */}
              <td>
                <div className="size-qty-column">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="ws-size-qty-box">
                      <span>Size: <strong>{item.size || 'Bulk'}</strong></span>
                      <span className="dot">•</span>
                      <span>Qty: <strong className="ws-qty-text">{item.quantity || 1} pcs</strong></span>
                    </div>
                  ))}
                </div>
              </td>

              {/* Buyer info */}
              <td>
                <p className="customer-name">{order.shippingAddress?.firstName || 'Business'} {order.shippingAddress?.lastName || 'Client'}</p>
                <p className="customer-sub">{order.shippingAddress?.email || order.userId?.email || 'No Email'}</p>
                <p className="customer-sub">{order.shippingAddress?.phone || order.userId?.phoneNumber || 'No Phone'}</p>
                <p className="customer-sub">{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
              </td>

              {/* Payment */}
              <td>
                <span className="payment-id">{order.paymentId || 'N/A'}</span>
                <p className="payment-type">Wholesale Payment</p>
              </td>

              {/* Total Price */}
              <td>
                <p className="total-price text-amber-700">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</p>
                <p className="item-count">{order.items?.length || 0} Bulk Item(s)</p>
              </td>

              {/* Status & Tracking */}
              <td>
                <div className="ws-status-cell-wrap">
                  <span className={`status-badge ${getBadgeClass(order.status)}`}>
                    {order.status === 'Paid' ? 'Order Received' : order.status}
                  </span>

                  {/* Display Tracking Details if present */}
                  {order.trackingCode && (
                    <div className="ws-tracking-summary-card">
                      <div className="tracking-code-row">
                        <Truck size={13} className="tracking-truck-icon" />
                        <span className="tracking-courier-name">
                          {order.courierName ? `${order.courierName}:` : 'AWB:'}
                        </span>
                        <strong className="tracking-id-text">{order.trackingCode}</strong>
                      </div>

                      {order.trackingUrl && (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tracking-url-link"
                          title="Open live tracking link"
                        >
                          <ExternalLink size={12} />
                          <span>Track Link</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </td>

              {/* Operations Dropdown & Tracking Action */}
              <td>
                <div className="ws-operations-cell-wrap">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={order.status}
                      onChange={(e) => handleStatusSelect(order, e.target.value)}
                      className="status-dropdown"
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <MenuItem key={st.value} value={st.value} style={{ color: st.color }}>
                          {st.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Quick button to add/edit tracking details and trigger email */}
                  <button
                    type="button"
                    className="ws-edit-tracking-btn"
                    onClick={() => handleOpenTrackingModal(order)}
                    title={order.trackingCode ? "Edit tracking ID / URL or resend email" : "Add tracking details"}
                  >
                    <Truck size={13} />
                    <span>{order.trackingCode ? 'Edit Tracking' : '+ Add Tracking'}</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Reusable Shipping & Tracking Modal */}
      <ShippingModal
        open={shippingModalOpen}
        onClose={() => {
          setShippingModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        targetStatus="Shipped"
        onSuccess={handleShippingModalSuccess}
      />
    </div>
  );
}