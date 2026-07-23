import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  TextField,
  Avatar,
  Typography,
  IconButton,
  Switch,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import "./ProductList.css";
import EditProduct from "../EditProduct/EditProduct";
import AdminProductDetail from "../AdminProductDetail/AdminProductDetail";
import api from "../../../api";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Detail View State
  const [viewProduct, setViewProduct] = useState(null);

  // Edit Dialog State
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({
    _id: "",
    productName: "",
    productNumber: "",
    description: "",
    price: "",
    stockCount: "",
    sizes: [],
    images: [],
  });

  const [newImages, setNewImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/products/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
      setFilteredProducts(res.data);

      // Refresh detail view if currently open
      if (viewProduct) {
        const updated = res.data.find((p) => p._id === viewProduct._id);
        if (updated) setViewProduct(updated);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const value = search.toLowerCase();
    const result = products.filter((product) => {
      return (
        product.productName?.toLowerCase().includes(value) ||
        product.productNumber?.toLowerCase().includes(value)
      );
    });
    setFilteredProducts(result);
    setPage(0);
  }, [search, products]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditOpen = (product, e) => {
    if (e) e.stopPropagation(); // Prevent opening detail view when clicking edit
    let sizes = product.sizes || [];

    if (typeof sizes === "string") {
      try {
        sizes = JSON.parse(sizes);
      } catch {
        sizes = sizes.split(",").map((s) => s.trim());
      }
    }

    setSelectedProduct({
      _id: product._id,
      productName: product.productName || "",
      productNumber: product.productNumber || "",
      description: product.description || "",
      price: product.price || "",
      stockCount: product.stockCount || "",
      sizes,
      images: product.images || [],
    });

    setPreviewImages([]);
    setNewImages([]);
    setOpenEdit(true);
  };

  const handleEditClose = () => {
    setOpenEdit(false);
  };

  const handleStatusToggle = async (productId, currentStatus, e) => {
    if (e) e.stopPropagation(); // Prevent opening detail view
    try {
      const token = localStorage.getItem("token");
      const newStatus = currentStatus === "active" ? "inactive" : "active";

      await axios.put(
        `http://localhost:5000/api/products/status/${productId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchProducts();
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation(); // Prevent opening detail view
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/products/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchProducts();
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <CircularProgress size={50} className="pastel-progress" />
      </div>
    );
  }

  // 🔴 CONDITIONAL RENDER: Show Detail View when a product is clicked
  if (viewProduct) {
    return (
      <AdminProductDetail
        product={viewProduct}
        onBack={() => setViewProduct(null)}
        onEdit={(prod) => {
          setViewProduct(null);
          handleEditOpen(prod);
        }}
      />
    );
  }

  return (
    <Paper className="product-paper" elevation={0}>
      <Typography variant="h5" className="table-title">
        Product Catalogue
      </Typography>

      <TextField
        fullWidth
        label="Search Products"
        placeholder="Search by Name or Product Number..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-field"
        variant="outlined"
      />

      <TableContainer className="custom-table-container">
        <Table>
          <TableHead className="table-header">
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Product Details</TableCell>
              <TableCell>Product No</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Stock Status</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...filteredProducts]
              .reverse()
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((product) => (
                <TableRow
                  key={product._id}
                  hover
                  className="table-body-row clickable-row"
                  onClick={() => setViewProduct(product)}
                  style={{ cursor: "pointer" }}
                >
                  <TableCell>
                    <Avatar
                      src={product.images && product.images[0]}
                      variant="rounded"
                      className="product-avatar"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography className="product-name">
                      {product.productName}
                    </Typography>
                    <Typography variant="body2" className="product-desc">
                      {product.description?.substring(0, 45)}...
                    </Typography>
                  </TableCell>
                  <TableCell className="text-muted">{product.productNumber}</TableCell>
                  <TableCell className="price-text">₹{product.price}</TableCell>
                  <TableCell className="text-muted">{product.stockCount}</TableCell>
                  <TableCell>
                    <Chip
                      label={product.stockStatus || "In Stock"}
                      size="small"
                      className={`status-chip ${
                        product.stockStatus === "Out Of Stock"
                          ? "chip-danger"
                          : product.stockStatus === "Few Stock Available"
                          ? "chip-warning"
                          : "chip-success"
                      }`}
                    />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={product.status === "active"}
                      onChange={(e) => handleStatusToggle(product._id, product.status, e)}
                      color="success"
                    />
                    <Typography variant="caption" display="block">
                      {product.status}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="View Full Details">
                      <IconButton
                        className="view-action-btn"
                        onClick={() => setViewProduct(product)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Product">
                      <IconButton
                        className="edit-action-btn"
                        onClick={(e) => handleEditOpen(product, e)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Product">
                      <IconButton
                        className="delete-action-btn"
                        onClick={(e) => handleDelete(product._id, e)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        page={page}
        rowsPerPage={rowsPerPage}
        count={filteredProducts.length}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsChange}
        rowsPerPageOptions={[5, 10, 20]}
      />

      <EditProduct
        open={openEdit}
        onClose={handleEditClose}
        product={selectedProduct}
        fetchProducts={fetchProducts}
      />
    </Paper>
  );
};

export default ProductList;