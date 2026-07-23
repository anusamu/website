// RetailOrder.jsx
import React from 'react';
import API from '../../../api';
import { toast } from 'react-toastify';
import { Select, MenuItem, FormControl } from '@mui/material';

import './RetailOrder.css';

const STATUS_OPTIONS = [
  { value: 'Paid', label: 'Order Received', color: '#16a34a', bg: '#f0fdf4' },
  { value: 'Packing', label: 'Packing', color: '#d97706', bg: '#fffbeb' },
  { value: 'Shipped', label: 'Shipped', color: '#0284c7', bg: '#f0f9ff' },
  { value: 'Delivered', label: 'Delivered', color: '#059669', bg: '#ecfdf5' },
];

export default function RetailOrder({ orders, setOrders, loading, statusFilter }) {

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await API.put(
        `/admin/update-status/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(`Retail Order status updated to ${newStatus === 'Paid' ? 'Order Received' : newStatus}`);
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
      case 'Paid': return 'badge-paid';
      case 'Packing': return 'badge-packing';
      case 'Shipped': return 'badge-shipped';
      case 'Delivered': return 'badge-delivered';
      default: return 'badge-default';
    }
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="spinner"></div>
        <p>Loading retail orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-empty">
        <p className="empty-title">No retail orders found</p>
        <p className="empty-sub">Orders placed by retail customers will show up here.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-tag retail-tag">Retail Orders List</div>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Product Details</th>
            <th>Size & Qty</th>
            <th>Customer Info</th>
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
                    const prodName = prodObj.productName || prodObj.productName || item.productName|| item.productName || 'Product';
                    const prodImg = prodObj.images?.[0] || prodObj.image || item.image || 'https://via.placeholder.com/60';
                    const unitPrice = item.price || prodObj.price || 0;

                    return (
                      <div key={idx} className="product-item">
                        <img src={prodImg} alt={prodName} className="product-img" />
                        <div>
                          <p className="product-title">{prodName}</p>
                          <div className="price-tag-wrap">
                            <span className="unit-price-tag">₹{unitPrice.toLocaleString('en-IN')}</span>
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
                    <div key={idx} className="size-qty-box">
                      <span>Size: <strong>{item.size || 'N/A'}</strong></span>
                      <span className="dot">•</span>
                      <span>Qty: <strong>{item.quantity || 1}</strong></span>
                    </div>
                  ))}
                </div>
              </td>

              {/* Customer */}
              <td>
                <p className="customer-name">{order.shippingAddress?.firstName || 'Guest'} {order.shippingAddress?.lastName || ''}</p>
                <p className="customer-sub">{order.shippingAddress?.phone || 'No Phone'}</p>
                <p className="customer-sub">{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
              </td>

              {/* Payment */}
              <td>
                <span className="payment-id">{order.paymentId || 'N/A'}</span>
                <p className="payment-type">Online (Razorpay)</p>
              </td>

              {/* Total Price */}
              <td>
                <p className="total-price">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</p>
                <p className="item-count">{order.items?.length || 0} Item(s)</p>
              </td>

              {/* Status */}
              <td>
                <span className={`status-badge ${getBadgeClass(order.status)}`}>
                  {order.status === 'Paid' ? 'Order Received' : order.status}
                </span>
              </td>

              {/* Actions Dropdown */}
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