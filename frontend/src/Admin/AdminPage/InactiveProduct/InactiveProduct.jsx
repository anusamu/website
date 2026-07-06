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
  Switch,
} from "@mui/material";

import "./InactiveProduct.css";
import api from "../../../api";

const InactiveProduct = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchInactiveProducts();
  }, []);

  const fetchInactiveProducts = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get( "products/admin/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
const handleStatusToggle = async (productId) => {
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
  }, [search, products]);

  if (loading) {
    return (
      <div className="loader-container">
        <CircularProgress />
      </div>
    );
  }

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
              .slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
              )
              .map((product) => (
                <TableRow key={product._id}>

                  <TableCell>
                    <Avatar
                      src={product.images?.[0]}
                      variant="rounded"
                    />
                  </TableCell>

                  <TableCell>
                    {product.productName}
                  </TableCell>

                  <TableCell>
                    {product.productNumber}
                  </TableCell>

                  <TableCell>
                    ₹{product.price}
                  </TableCell>

                  <TableCell>
                    {product.stockCount}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label="Inactive"
                      className="inactive-chip"
                    />
                  </TableCell>
                  <TableCell>
  <Switch
    checked={false}
    onChange={() => handleStatusToggle(product._id)}
    color="success"
  />

  <Typography variant="caption">
    Make Active
  </Typography>
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