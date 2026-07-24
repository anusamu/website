import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CategoryProducts.css";
import Navbar from "../../../components/Navbar/Navbar";
import api from "../../../api";
import { useCart } from "../../../components/Context/CartContext";
import { toast } from "react-toastify";
import Footer from "../../../components/Footer/Footer";

const CategoryProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track selected sizes per product using an object map: { [productId]: selectedSize }
  const [selectedSizes, setSelectedSizes] = useState({});

  const location = useLocation();
  const navigate = useNavigate();

  // Extract addToCart from provider
  const { addToCart } = useCart();

  // Extract query parameters
  const queryParams = new URLSearchParams(location.search);
  const selectedCategory = queryParams.get("category");
  const selectedCollection = queryParams.get("collection");
  const filter = queryParams.get("filter");
  const searchQuery = queryParams.get("search");

  // Helper function to calculate total stock quantity
  const calculateTotalStock = (product) => {
    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      return product.sizes.reduce((sum, item) => {
        if (typeof item === "object" && item !== null) {
          return sum + (Number(item.quantity) || 0);
        }
        return sum;
      }, 0);
    }
    return Number(product.stockCount) || 0;
  };

  // Helper to extract size options array cleanly from product object
  const getAvailableSizes = (product) => {
    if (!Array.isArray(product.sizes)) return [];
    return product.sizes
      .map((item) => {
        if (typeof item === "string") return item;
        if (typeof item === "object" && item !== null) return item.size;
        return null;
      })
      .filter(Boolean);
  };

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const queryParts = [];
        if (selectedCategory) queryParts.push(`category=${encodeURIComponent(selectedCategory.trim())}`);
        if (selectedCollection) queryParts.push(`collection=${encodeURIComponent(selectedCollection.trim())}`);
        if (filter) queryParts.push(`filter=${encodeURIComponent(filter.trim())}`);
        if (searchQuery) queryParts.push(`search=${encodeURIComponent(searchQuery.trim())}`);

        const queryString = queryParts.length ? `?${queryParts.join("&")}` : "";
        const res = await api.get(`/shop-products${queryString}`);
        const returned = res.data;
        const allProducts = Array.isArray(returned) ? returned : returned.products || returned.data || [];

        // Filter active products
        let activeOnlyProducts = allProducts.filter(
          (product) => product.status === "active" || product.status === undefined
        );

        // Client-side fallback filter for Search Query across name, category, item, collection, and description
        if (searchQuery && searchQuery.trim() !== "") {
          const query = searchQuery.trim().toLowerCase();
          activeOnlyProducts = activeOnlyProducts.filter((product) => {
            const matchesName = product.productName?.toLowerCase().includes(query);
            const matchesCategory = product.category?.toLowerCase().includes(query);
            const matchesItem = product.item?.toLowerCase().includes(query);
            const matchesCollection = (product.collect || product.collection)?.toLowerCase().includes(query);
            const matchesDescription = product.description?.toLowerCase().includes(query);

            return matchesName || matchesCategory || matchesItem || matchesCollection || matchesDescription;
          });
        }

        // Pre-populate default size selection for each product
        const initialSizes = {};
        activeOnlyProducts.forEach((prod) => {
          const prodId = prod._id || prod.id;
          const available = getAvailableSizes(prod);
          if (available.length > 0) {
            initialSizes[prodId] = available[0]; // Default to first available size
          }
        });

        setSelectedSizes(initialSizes);
        setProducts(activeOnlyProducts);
      } catch (err) {
        console.error("Error loading products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [selectedCategory, selectedCollection, filter, searchQuery]);

  // Handle size selection for a product card
  const handleSizeChange = (productId, newSize, event) => {
    event.stopPropagation();
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: newSize,
    }));
  };

  const handleCardClick = (productId) => {
    if (productId) {
      navigate(`/product/${productId}`);
    } else {
      console.warn("Product does not have a valid ID string.");
    }
  };

  // Click handler for Add to Cart button
  const handleAddToCartClick = async (product, event) => {
    event.stopPropagation();

    const isLoggedIn = !!localStorage.getItem("token");
    if (!isLoggedIn) {
      toast.warn("Please log in to add items to your shopping cart!");
      return navigate("/login");
    }

    const productId = product._id || product.id;
    const availableSizes = getAvailableSizes(product);

    // Get selected size from state or fallback to first size / Standard
    const chosenSize = selectedSizes[productId] || availableSizes[0] || "Standard";

    const success = await addToCart(productId, 1, chosenSize);

    if (success) {
      const isOther = chosenSize.toString().trim().toLowerCase() === "other";
      toast.success(
        isOther
          ? `${product.productName} added to cart!`
          : `${product.productName} (${chosenSize}) added to cart!`
      );
    } else {
      toast.error("Failed to add item to cart. Try again.");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="cat-grid-status-box" style={{ padding: "100px 20px", textAlign: "center" }}>
          <p className="cat-status-message">Loading premium collections...</p>
        </div>
        <Footer />
      </>
    );
  }

  const getHeaderTitle = () => {
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    if (filter === "newest") return "Latest Arrivals";
    if (selectedCollection) return selectedCollection;
    if (selectedCategory) return selectedCategory;
    return "Our Entire Catalogue";
  };

  const getHeaderSubtitle = () => {
    if (searchQuery) return `Showing ${products.length} result${products.length === 1 ? "" : "s"} for "${searchQuery}".`;
    if (filter === "newest") return "Showing the latest arrival products.";
    if (selectedCollection) return `Products from the ${selectedCollection} collection.`;
    if (selectedCategory) return `Products in the ${selectedCategory} category.`;
    return `Showing ${products.length} elegant items matching your selection.`;
  };

  return (
    <>
      <Navbar />
      <section className="cat-products-section">
        <div className="cat-ambient-bg-glow" />

        <div className="cat-products-container">
          <header className="cat-grid-header">
            <h1 className="cat-grid-title">{getHeaderTitle()}</h1>
            <p className="cat-grid-subtitle">{getHeaderSubtitle()}</p>
          </header>

          {error && <p className="cat-error-message">{error}</p>}

          {products.length > 0 ? (
            <div className="cat-products-layout-grid">
              {products.map((product, index) => {
                const productId = product._id || product.id;
                const displayImage =
                  product.images?.[0] ||
                  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600";
                const title = product.productName || "Borderless cloth item...";
                const price = `₹ ${product.price}`;

                const totalStock = calculateTotalStock(product);
                const isOutOfStock = product.stockStatus === "Out Of Stock" || totalStock <= 0;
                const availableSizes = getAvailableSizes(product);
                const currentSelectedSize = selectedSizes[productId] || availableSizes[0];

                const isSizeOther =
                  currentSelectedSize &&
                  currentSelectedSize.toString().trim().toLowerCase() === "other";

                const hasOnlyOtherSize =
                  availableSizes.length > 0 &&
                  availableSizes.every((sz) => sz.toString().trim().toLowerCase() === "other");

                return (
                  <div
                    key={productId || index}
                    className="cat-product-display-card"
                    onClick={() => handleCardClick(productId)}
                  >
                    {/* Image & Quick Add Button */}
                    <div className="cat-product-image-container">
                      <img
                        src={displayImage}
                        alt={title}
                        className="cat-product-display-img"
                        loading="lazy"
                      />

                      <button
                        type="button"
                        className="cat-action-add-to-cart-btn"
                        disabled={isOutOfStock}
                        onClick={(event) => handleAddToCartClick(product, event)}
                      >
                        {isOutOfStock
                          ? "Out of Stock"
                          : isSizeOther || !currentSelectedSize
                          ? "Add to Cart"
                          : `Add to Cart (${currentSelectedSize})`}
                      </button>
                    </div>

                    {/* Meta details & Size selector */}
                    <div className="cat-product-meta-details">
                      <h3 className="cat-product-meta-title" title={title}>
                        {title}
                      </h3>
                      <p className="cat-product-meta-price">{price}</p>

                      {/* Render Size Selector Badges */}
                      {availableSizes.length > 0 && !hasOnlyOtherSize ? (
                        <div
                          className="cat-product-sizes-row"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {availableSizes.map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              className={`cat-size-badge-btn ${currentSelectedSize === sz ? "active" : ""}`}
                              onClick={(e) => handleSizeChange(productId, sz, e)}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="cat-product-sizes-placeholder" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="cat-empty-state-box" style={{ padding: "60px 20px", textAlign: "center" }}>
              <p className="cat-empty-text">No active products found matching your search or filters.</p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default CategoryProducts;