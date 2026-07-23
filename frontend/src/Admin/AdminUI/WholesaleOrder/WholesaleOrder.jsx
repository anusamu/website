// WholesaleOrder.jsx
import React from 'react';
import API from '../../../api';
import { toast } from 'react-toastify';
import { Select, MenuItem, FormControl } from '@mui/material';

import './WholesaleOrder.css';

const STATUS_OPTIONS = [
  { value: 'Paid', label: 'Order Received', color: '#16a34a', bg: '#f0fdf4' },
  { value: 'Packing', label: 'Packing', color: '#d97706', bg: '#fffbeb' },
  { value: 'Shipped', label: 'Shipped', color: '#0284c7', bg: '#f0f9ff' },
  { value: 'Delivered', label: 'Delivered', color: '#059669', bg: '#ecfdf5' },
];

export default function WholesaleOrder({ orders, setOrders, loading, statusFilter }) {

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await API.put(
        `/admin/update-status/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(`Wholesale Order status updated to ${newStatus === 'Paid' ? 'Order Received' : newStatus}`);
        setOrders(prev =>
          prev.map(o => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
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
            <th>Status</th>
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
                    const prodName = prodObj.name || prodObj.title || item.name || item.title || 'Product';
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
                <p className="customer-sub">{order.shippingAddress?.phone || 'No Phone'}</p>
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

              {/* Status */}
              <td>
                <span className={`status-badge ${getBadgeClass(order.status)}`}>
                  {order.status === 'Paid' ? 'Order Received' : order.status}
                </span>
              </td>

              {/* Action Dropdown */}
              <td>
                <FormControl size="small" fullWidth>
                  <Select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="status-dropdown"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <MenuItem key={st.value} value={st.value} style={{ color: st.color }}>
                        {st.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}