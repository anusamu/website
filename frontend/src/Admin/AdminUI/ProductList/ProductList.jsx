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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import "./ProductList.css";
import EditProduct from "../EditProduct/EditProduct";
import api from "../../../api";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
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
    images: []
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

  const handleEditOpen = (product) => {
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

  const handleEditChange = (e) => {
    setSelectedProduct({
      ...selectedProduct,
      [e.target.name]: e.target.value,
    });
  };

  const handleSizeChange = (e) => {
    const { value, checked } = e.target;

    setSelectedProduct((prev) => ({
      ...prev,
      sizes: checked
        ? [...new Set([...prev.sizes, value])]
        : prev.sizes.filter((size) => size !== value),
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
    const preview = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(preview);
  };

  const handleUpdateSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("productName", selectedProduct.productName);
      formData.append("productNumber", selectedProduct.productNumber);
      formData.append("description", selectedProduct.description);
      formData.append("price", selectedProduct.price);
      formData.append("stockCount", selectedProduct.stockCount);

      const sizes = Array.isArray(selectedProduct.sizes) ? selectedProduct.sizes : [];
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("existingImages", JSON.stringify(selectedProduct.images || []));

      newImages.forEach((image) => {
        formData.append("images", image);
      });

      await axios.put(
        `http://localhost:5000/api/products/update/${selectedProduct._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      fetchProducts();
      handleEditClose();
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const handleStatusToggle = async (productId, currentStatus) => {
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

  const handleDelete = async (id) => {
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
            {/* Added [...filteredProducts].reverse() to show newest entries first */}
            {[...filteredProducts]
              .reverse()
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((product) => (
                <TableRow key={product._id} hover className="table-body-row">
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
                  <TableCell>
                    <Switch
                      checked={product.status === "active"}
                      onChange={() => handleStatusToggle(product._id, product.status)}
                      color="success"
                    />
                    <Typography variant="caption" display="block">
                      {product.status}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton className="edit-action-btn" onClick={() => handleEditOpen(product)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton className="delete-action-btn" onClick={() => handleDelete(product._id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
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