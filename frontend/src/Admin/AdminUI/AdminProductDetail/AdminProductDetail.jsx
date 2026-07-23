import React, { useState } from "react";
import "./AdminProductDetail.css";

const AdminProductDetail = ({ product, onBack, onEdit }) => {
  if (!product) {
    return (
      <div className="pastel-empty-state">
        <div className="empty-icon">📦</div>
        <h3>No Product Selected</h3>
        <p>Please select a valid product from the inventory list.</p>
        <button className="btn-pastel-primary" onClick={onBack}>
          ← Return to Products
        </button>
      </div>
    );
  }

  // Active gallery image state
  const [activeImage, setActiveImage] = useState(
    product.images?.[0] || "/placeholder-image.jpg"
  );

  // Helper for stock status color pill
  const getStockPillClass = (status) => {
    switch (status) {
      case "In Stock":
        return "badge-pastel-green";
      case "Few Stock Available":
        return "badge-pastel-yellow";
      case "Out Of Stock":
        return "badge-pastel-red";
      default:
        return "badge-pastel-gray";
    }
  };

  return (
    <div className="pastel-admin-wrapper full-width">
      
      {/* EASY-NOTIFY ALERT BANNER */}
      {product.stockStatus === "Out Of Stock" && (
        <div className="notify-banner banner-danger">
          <span className="banner-icon">⚠️</span>
          <span>
            <strong>Inventory Alert:</strong> This product is currently <strong>Out of Stock</strong> and set to <strong>Inactive</strong>.
          </span>
        </div>
      )}

      {product.stockStatus === "Few Stock Available" && (
        <div className="notify-banner banner-warning">
          <span className="banner-icon">⚡</span>
          <span>
            <strong>Low Stock Warning:</strong> Only <strong>{product.stockCount} total units</strong> remaining across sizes.
          </span>
        </div>
      )}

      {/* TOP BAR NAVIGATION */}
      <div className="pastel-top-bar">
        <div className="top-bar-left">
          <button className="btn-pastel-back" onClick={onBack}>
            ← Back to Products
          </button>
          
          <div className="breadcrumb-trail">
            <span>{product.category}</span>
            <span className="divider">/</span>
            <span>{product.type}</span>
          </div>
        </div>

        <div className="top-bar-right">
          <span className="sku-tag">SKU: {product.productNumber}</span>

          <span
            className={`status-pill ${
              product.status === "active" ? "status-active" : "status-inactive"
            }`}
          >
            <span className="dot"></span>
            {product.status || "active"}
          </span>

          {onEdit && (
            <button className="btn-pastel-edit" onClick={() => onEdit(product)}>
              ✏️ Edit Product
            </button>
          )}
        </div>
      </div>

      {/* HERO SECTION: Gallery + Pricing Overview */}
      <div className="bento-grid full-grid">
        
        {/* LEFT CARD: Image Gallery */}
        <div className="bento-card card-media">
          <div className="hero-stage">
            <img src={activeImage} alt={product.productName} />
          </div>

          {product.images?.length > 1 && (
            <div className="thumbs-row">
              {product.images.map((imgUrl, index) => (
                <button
                  key={index}
                  className={`thumb-btn ${activeImage === imgUrl ? "selected" : ""}`}
                  onClick={() => setActiveImage(imgUrl)}
                >
                  <img src={imgUrl} alt={`Thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT CARD: Main Overview & Attributes */}
        <div className="bento-card card-overview">
          <div className="header-meta">
            <span className="category-chip">{product.category}</span>
            {product.collect && (
              <span className="collection-chip">Collection: {product.collect}</span>
            )}
          </div>

          <h1 className="product-title">{product.productName}</h1>

          <div className="price-hero-box">
            <div className="price-group">
              <span className="price-label">Retail Price</span>
              <span className="price-value">₹{Number(product.price || 0).toLocaleString()}</span>
            </div>
            
            <div className="stock-quick-metric">
              <span className="price-label">Total Inventory</span>
              <span className={`status-tag ${getStockPillClass(product.stockStatus)}`}>
                {product.stockCount || 0} Units • {product.stockStatus || "In Stock"}
              </span>
            </div>
          </div>

          <div className="description-block">
            <h3>Product Description</h3>
            <p>{product.description || "No description supplied."}</p>
          </div>

          {/* Key Attributes Grid */}
          <div className="attributes-grid">
            <div className="attr-item">
              <span className="attr-label">Gender Target</span>
              <span className="attr-val">{product.gender || "Unisex"}</span>
            </div>
            <div className="attr-item">
              <span className="attr-label">Item Category</span>
              <span className="attr-val">{product.item || "—"}</span>
            </div>
            <div className="attr-item">
              <span className="attr-label">Body Part</span>
              <span className="attr-val">{product.part || "—"}</span>
            </div>
            <div className="attr-item">
              <span className="attr-label">Material</span>
              <span className="attr-val">{product.material || "N/A"}</span>
            </div>
          </div>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="colors-section">
              <span className="attr-label">Available Colors</span>
              <div className="color-pills-wrap">
                {product.colors.map((color, idx) => (
                  <span key={idx} className="pastel-color-pill">
                    {color}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* FULL-WIDTH SIZES & INVENTORY DASHBOARD CARD */}
      <div className="bento-card card-sizes-full">
        <div className="sizes-header">
          <div>
            <h2 className="card-heading">Size & Stock Inventory Breakdown</h2>
            <p className="sub-heading">Real-time stock level status per size option</p>
          </div>
          <div className="sizes-legend">
            <span className="legend-item"><span className="legend-dot dot-green"></span> Available (&gt; 5)</span>
            <span className="legend-item"><span className="legend-dot dot-yellow"></span> Low Stock (1–5)</span>
            <span className="legend-item"><span className="legend-dot dot-red"></span> Sold Out (0)</span>
          </div>
        </div>

        {product.sizes?.length > 0 ? (
          <div className="sizes-cards-grid">
            {product.sizes.map((s, index) => {
              const qty = Number(s.quantity) || 0;
              const statusClass = qty > 5 ? "status-ok" : qty > 0 ? "status-low" : "status-out";
              const labelText = qty > 5 ? "In Stock" : qty > 0 ? "Low Stock" : "Out of Stock";

              return (
                <div key={index} className={`size-tile ${statusClass}`}>
                  <div className="size-tile-top">
                    <span className="size-label-bold">{s.size}</span>
                    <span className={`size-pill-status ${statusClass}`}>{labelText}</span>
                  </div>
                  
                  <div className="size-tile-bottom">
                    <span className="size-qty-num">{qty}</span>
                    <span className="size-qty-unit">units remaining</span>
                  </div>

                  {/* Stock Bar Indicator */}
                  <div className="stock-bar-track">
                    <div 
                      className="stock-bar-fill" 
                      style={{ width: `${Math.min(qty * 10, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-sizes-box">
            <p>No size breakdown mapped for this item.</p>
          </div>
        )}

        {/* System Meta Details */}
        <div className="system-meta-footer">
          <div className="sys-item">
            <span>Database ID:</span>
            <span className="mono">{product._id}</span>
          </div>
          <div className="sys-item">
            <span>Created At:</span>
            <span>{product.createdAt ? new Date(product.createdAt).toLocaleString() : "N/A"}</span>
          </div>
          <div className="sys-item">
            <span>Last Updated:</span>
            <span>{product.updatedAt ? new Date(product.updatedAt).toLocaleString() : "N/A"}</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminProductDetail;