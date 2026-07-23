import React, { useEffect, useState } from "react";
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
  Switch,
} from "@mui/material";

import "./InactiveProduct.css";
import api from "../../../api";
import AdminProductDetail from "../../AdminUI/AdminProductDetail/AdminProductDetail"; // Adjust import path if needed

const InactiveProduct = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Selected product state for Detail View
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchInactiveProducts();
  }, []);

  const fetchInactiveProducts = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("products/admin/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const inactiveProducts = res.data.filter(
        (product) => product.status === "inactive"
      );

      setProducts(inactiveProducts);
      setFilteredProducts(inactiveProducts);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (e, productId) => {
    // Stop event propagation so row click isn't triggered when toggling status
    e.stopPropagation();

    try {
      const token = localStorage.getItem("token");

      await api.put(
        `products/status/${productId}`,
        {
          status: "active",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove the product immediately from UI
      const updatedProducts = products.filter(
        (product) => product._id !== productId
      );

      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);

      // If viewing the toggled product in detail, close detail view
      if (selectedProduct && selectedProduct._id === productId) {
        setSelectedProduct(null);
      }
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  useEffect(() => {
    const value = search.toLowerCase();

    const result = products.filter(
      (product) =>
        product.productName?.toLowerCase().includes(value) ||
        product.productNumber?.toLowerCase().includes(value)
    );

    setFilteredProducts(result);
    setPage(0); // Reset pagination on search
  }, [search, products]);

  if (loading) {
    return (
      <div className="loader-container">
        <CircularProgress />
      </div>
    );
  }

  // 🟢 IF A PRODUCT IS SELECTED: Render the Full Detail Component
  if (selectedProduct) {
    return (
      <AdminProductDetail
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
      />
    );
  }

  // 🔴 DEFAULT TABLE VIEW
  return (
    <Paper className="inactive-paper">
      <Typography variant="h5" className="inactive-title">
        Inactive Products
      </Typography>

      <TextField
        fullWidth
        label="Search Inactive Products"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="inactive-search"
      />

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell>Product Number</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredProducts
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((product) => (
                <TableRow
                  key={product._id}
                  hover
                  onClick={() => setSelectedProduct(product)}
                  style={{ cursor: "pointer" }}
                  className="interactive-row"
                >
                  <TableCell>
                    <Avatar
                      src={product.images?.[0]}
                      variant="rounded"
                      alt={product.productName}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography fontWeight="600" variant="body2">
                      {product.productName}
                    </Typography>
                  </TableCell>

                  <TableCell>{product.productNumber}</TableCell>

                  <TableCell>
                    ₹{Number(product.price || 0).toLocaleString()}
                  </TableCell>

                  <TableCell>{product.stockCount ?? 0}</TableCell>

                  <TableCell>
                    <Chip label="Inactive" className="inactive-chip" />
                  </TableCell>

                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Switch
                        checked={false}
                        onChange={(e) => handleStatusToggle(e, product._id)}
                        color="success"
                      />
                      <Typography variant="caption" color="textSecondary">
                        Make Active
                      </Typography>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredProducts.length}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 20]}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </Paper>
  );
};

export default InactiveProduct;