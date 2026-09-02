import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../api";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import CustomCursor from "../../../components/CustomCursor/CustomCursor";
import { generateInvoicePDF, openInvoicePDF } from "../../../utils/invoiceGenerator";
import "./MyOrders.css";

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Simple filter
  const [statusFilter, setStatusFilter] = useState("all");
  const [downloadingId, setDownloadingId] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (err) {
        console.warn("Could not parse user session:", err);
      }
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await api.get("/MyOrders");
        const resultData = response.data;
        const ordersArray = Array.isArray(resultData)
          ? resultData
          : (resultData?.orders || resultData?.data || []);

        setOrders(ordersArray);
        setError(null);
      } catch (err) {
        console.error("Error fetching orders:", err.response || err.message);
        setError("Unable to load your orders.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  // Direct PDF Download
  const handleDownloadInvoice = async (order) => {
    const orderId = order._id;
    try {
      setDownloadingId(orderId);
      generateInvoicePDF(order, currentUser);
      toast.success("Invoice downloaded successfully!");
    } catch (err) {
      console.error("Failed to download invoice:", err);
      toast.error("Could not download invoice.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Open PDF in new tab
  const handleOpenPdfTab = (order) => {
    try {
      openInvoicePDF(order, currentUser);
    } catch (err) {
      console.error("Failed to open invoice PDF:", err);
      toast.error("Could not open PDF.");
    }
  };

  const formatOrderDate = (dateString) => {
    if (!dateString) return "Recent";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((o) => {
      const st = (o.status || "Paid").toLowerCase();
      if (statusFilter === "processing") return ["paid", "packing"].includes(st);
      return st === statusFilter;
    });
  }, [orders, statusFilter]);

  return (
    <div className="simple-orders-page">
      <CustomCursor />
      <Navbar />

      <main className="simple-orders-container">
        {/* Simple Page Header */}
        <div className="simple-orders-header">
          <div>
            <h1 className="simple-orders-title">My Orders</h1>
            <p className="simple-orders-subtitle">
              {orders.length} {orders.length === 1 ? "order" : "orders"} placed
            </p>
          </div>

          {/* Simple Clean Tabs */}
          <div className="simple-orders-tabs">
            <button
              className={`simple-tab ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All
            </button>
            <button
              className={`simple-tab ${statusFilter === "processing" ? "active" : ""}`}
              onClick={() => setStatusFilter("processing")}
            >
              Processing
            </button>
            <button
              className={`simple-tab ${statusFilter === "shipped" ? "active" : ""}`}
              onClick={() => setStatusFilter("shipped")}
            >
              Shipped
            </button>
            <button
              className={`simple-tab ${statusFilter === "delivered" ? "active" : ""}`}
              onClick={() => setStatusFilter("delivered")}
            >
              Delivered
            </button>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="simple-orders-status">Loading orders...</div>
        ) : error ? (
          <div className="simple-orders-status error">{error}</div>
        ) : filteredOrders.length === 0 ? (
          <div className="simple-orders-empty">
            <p>No orders found.</p>
            <button className="simple-shop-btn" onClick={() => navigate("/shop")}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="simple-orders-list">
            {filteredOrders.map((order) => {
              const orderId = order._id;
              const shortId = orderId ? orderId.slice(-8).toUpperCase() : "N/A";
              const status = order.status || "Paid";
              const isDownloading = downloadingId === orderId;

              const shipping = order.shippingAddress || {};
              const addressText = [shipping.firstName, shipping.city, shipping.pincode]
                .filter(Boolean)
                .join(", ");

              return (
                <div key={orderId} className="simple-order-card">
                  {/* Simple Header */}
                  <div className="simple-card-top">
                    <div className="simple-top-left">
                      <span className="simple-order-id">Order #{shortId}</span>
                      <span className="simple-dot">•</span>
                      <span className="simple-order-date">{formatOrderDate(order.createdAt)}</span>
                      <span className="simple-dot">•</span>
                      <span className={`simple-status-badge ${status.toLowerCase()}`}>
                        {status}
                      </span>
                    </div>

                    <div className="simple-top-right">
                      <span className="simple-total-text">
                        Total: <strong>₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="simple-card-items">
                    {(order.items || []).map((item, idx) => {
                      const product = item.product || {};
                      const productId = product._id || product.id || item.product;
                      const productName = item.productName || product.productName || item.name || "Product";
                      const productImage = product.images?.[0] || product.image || "/placeholder-image.jpg";
                      const itemPrice = Number(item.price || product.price || 0);

                      return (
                        <div key={idx} className="simple-item-row">
                          <img
                            src={productImage}
                            alt={productName}
                            className="simple-item-image"
                            onClick={() => productId && navigate(`/product/${productId}`)}
                            onError={(e) => { e.target.src = "/placeholder-image.jpg"; }}
                          />

                          <div className="simple-item-info">
                            <h4
                              className="simple-item-name"
                              onClick={() => productId && navigate(`/product/${productId}`)}
                            >
                              {productName}
                            </h4>
                            <p className="simple-item-meta">
                              Size: {item.size || "OS"} | Qty: {item.quantity || 1}
                            </p>
                          </div>

                          <div className="simple-item-price">
                            ₹{itemPrice.toLocaleString("en-IN")}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Simple Footer */}
                  <div className="simple-card-bottom">
                    <div className="simple-address-snippet">
                      {addressText ? `Deliver to: ${addressText}` : "Order Confirmed"}
                      {order.trackingCode && ` | Tracking: ${order.trackingCode}`}
                    </div>

                    <div className="simple-card-actions">
                      <button
                        className="simple-btn simple-view-btn"
                        onClick={() => setViewingOrder(order)}
                      >
                        View Invoice
                      </button>

                      <button
                        className="simple-btn simple-download-btn"
                        onClick={() => handleDownloadInvoice(order)}
                        disabled={isDownloading}
                      >
                        {isDownloading ? "Downloading..." : "Download Invoice"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Simple Invoice View Modal */}
      {viewingOrder && (
        <div className="simple-modal-overlay" onClick={() => setViewingOrder(null)}>
          <div className="simple-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="simple-modal-header">
              <h3>Invoice - #{viewingOrder._id.slice(-8).toUpperCase()}</h3>
              <button 
                className="simple-modal-close" 
                onClick={() => setViewingOrder(null)}
              >
                &times;
              </button>
            </div>

            <div className="simple-modal-body">
              <div className="simple-inv-top">
                <div>
                  <h4>RAJAGOPAL HANDLOOM</h4>
                  <p>East Fort, Trivandrum, Kerala</p>
                  <p>rajagopalhandloom@gmail.com</p>
                </div>
                <div className="simple-inv-meta">
                  <p><strong>Date:</strong> {formatOrderDate(viewingOrder.createdAt)}</p>
                  <p><strong>Status:</strong> {viewingOrder.status || "Paid"}</p>
                </div>
              </div>

              <div className="simple-inv-customer">
                <p><strong>Billed To:</strong></p>
                <p>{viewingOrder.shippingAddress?.firstName || "Customer"} {viewingOrder.shippingAddress?.lastName || ""}</p>
                <p>{viewingOrder.shippingAddress?.address || ""}</p>
                <p>{viewingOrder.shippingAddress?.city || ""}, {viewingOrder.shippingAddress?.state || ""} {viewingOrder.shippingAddress?.pincode || ""}</p>
                <p>Phone: {viewingOrder.shippingAddress?.phone || "N/A"}</p>
              </div>

              <table className="simple-inv-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Size</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(viewingOrder.items || []).map((it, idx) => {
                    const price = Number(it.price || it.product?.price || 0);
                    const qty = it.quantity || 1;
                    return (
                      <tr key={idx}>
                        <td>{it.productName || it.product?.productName || "Product"}</td>
                        <td>{it.size || "OS"}</td>
                        <td>{qty}</td>
                        <td>₹{price.toLocaleString("en-IN")}</td>
                        <td>₹{(price * qty).toLocaleString("en-IN")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="simple-inv-totals">
                <p>Delivery: <strong>FREE</strong></p>
                <p className="simple-grand-total">
                  Total Amount: <strong>₹{Number(viewingOrder.totalAmount || 0).toLocaleString("en-IN")}</strong>
                </p>
              </div>
            </div>

            <div className="simple-modal-footer">
              <button 
                className="simple-btn simple-view-btn"
                onClick={() => handleOpenPdfTab(viewingOrder)}
              >
                Open in Tab
              </button>

              <button 
                className="simple-btn simple-download-btn"
                onClick={() => handleDownloadInvoice(viewingOrder)}
              >
                Download PDF
              </button>

              <button 
                className="simple-btn simple-close-btn"
                onClick={() => setViewingOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MyOrders;