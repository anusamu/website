import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import "./EditProduct.css";
const EditProduct = ({ open, onClose, product, fetchProducts }) => {
  const [selectedProduct, setSelectedProduct] = useState(product);
  const [newImages, setNewImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    setSelectedProduct(product);
  }, [product]);

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

    const preview = files.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviewImages(preview);
  };

  const handleUpdateSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();

      formData.append(
        "productName",
        selectedProduct.productName
      );

      formData.append(
        "productNumber",
        selectedProduct.productNumber
      );

      formData.append(
        "description",
        selectedProduct.description
      );

      formData.append("price", selectedProduct.price);

      formData.append(
        "stockCount",
        selectedProduct.stockCount
      );

      formData.append(
        "sizes",
        JSON.stringify(selectedProduct.sizes || [])
      );

      formData.append(
        "existingImages",
        JSON.stringify(selectedProduct.images || [])
      );

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
      onClose();

    } catch (error) {
      console.log(error.response?.data);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        Modify Product Information
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "grid", gap: 2 }}>
          <TextField
            fullWidth
            label="Product Name"
            name="productName"
            value={selectedProduct.productName || ""}
            onChange={handleEditChange}
          />

          <TextField
            fullWidth
            label="Product Number"
            name="productNumber"
            value={selectedProduct.productNumber || ""}
            onChange={handleEditChange}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            name="description"
            value={selectedProduct.description || ""}
            onChange={handleEditChange}
          />

          <TextField
            fullWidth
            type="number"
            label="Price"
            name="price"
            value={selectedProduct.price || ""}
            onChange={handleEditChange}
          />

          <TextField
            fullWidth
            type="number"
            label="Stock Count"
            name="stockCount"
            value={selectedProduct.stockCount || ""}
            onChange={handleEditChange}
          />

          <Typography>
            Available Sizes
          </Typography>

          <FormGroup row>
            {["Small", "Medium", "Large", "XL"].map(
              (size) => (
                <FormControlLabel
                  key={size}
                  control={
                    <Checkbox
                      checked={
                        selectedProduct.sizes?.includes(
                          size
                        ) || false
                      }
                      value={size}
                      onChange={handleSizeChange}
                    />
                  }
                  label={size}
                />
              )
            )}
          </FormGroup>

          <Box>
            {selectedProduct.images?.map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                width="80"
                style={{ margin: "5px" }}
              />
            ))}

            {previewImages.map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                width="80"
                style={{ margin: "5px" }}
              />
            ))}
          </Box>

          <Button variant="outlined" component="label">
            Upload Images
            <input
              hidden
              multiple
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </Button>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleUpdateSubmit}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProduct;