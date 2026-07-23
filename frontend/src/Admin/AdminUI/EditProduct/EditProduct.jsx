import React, { useEffect, useState } from "react";
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
  FormLabel,
  InputAdornment,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import api from "../../../api";
import "./EditProduct.css";

const EditProduct = ({ open, onClose, product, fetchProducts }) => {
  const [selectedProduct, setSelectedProduct] = useState(product || {});
  const [newImages, setNewImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const sizeOptions = [
    "Small", "Medium", "Large", "XL", "XXL",
    "2 inch", "3 inch", "4 inch", "5 inch", "12 inch", "24 inch"
  ];

  useEffect(() => {
    if (product) {
      setSelectedProduct({
        ...product,
        sizes: Array.isArray(product.sizes) ? product.sizes : []
      });
      setNewImages([]);
      setPreviewImages([]);
    }
  }, [product]);

  const handleEditChange = (e) => {
    setSelectedProduct({
      ...selectedProduct,
      [e.target.name]: e.target.value,
    });
  };

  // Toggle selection of a size
  const handleSizeToggle = (sizeName) => {
    const currentSizes = selectedProduct.sizes || [];
    const exists = currentSizes.some((s) => s.size === sizeName);

    let updatedSizes = [];
    if (exists) {
      updatedSizes = currentSizes.filter((s) => s.size !== sizeName);
    } else {
      updatedSizes = [...currentSizes, { size: sizeName, quantity: 0 }];
    }

    setSelectedProduct({ ...selectedProduct, sizes: updatedSizes });
  };

  // Update specific size quantity
  const handleSizeQuantityChange = (sizeName, quantityValue) => {
    const qty = Math.max(0, parseInt(quantityValue, 10) || 0);
    const currentSizes = selectedProduct.sizes || [];
    const updatedSizes = currentSizes.map((s) =>
      s.size === sizeName ? { ...s, quantity: qty } : s
    );
    setSelectedProduct({ ...selectedProduct, sizes: updatedSizes });
  };

  // Calculate total stock on the fly
  const totalCalculatedStock = (selectedProduct.sizes || []).reduce(
    (acc, curr) => acc + (Number(curr.quantity) || 0),
    0
  );

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setNewImages((prev) => [...prev, ...files]);
    setPreviewImages((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removeExistingImage = (index) => {
    const updatedImages = selectedProduct.images.filter((_, i) => i !== index);
    setSelectedProduct({ ...selectedProduct, images: updatedImages });
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewImages[index]);
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateSubmit = async () => {
  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();

    // Pass all current product values safely
    formData.append("productName", selectedProduct.productName || "");
    formData.append("productNumber", selectedProduct.productNumber || "");
    formData.append("description", selectedProduct.description || "");
    formData.append("price", selectedProduct.price || 0);
    formData.append("item", selectedProduct.item || "");
    formData.append("collect", selectedProduct.collect || "");
    formData.append("category", selectedProduct.category || "");
    formData.append("type", selectedProduct.type || "");
    formData.append("gender", selectedProduct.gender || "");
    formData.append("part", selectedProduct.part || "");
    formData.append("material", selectedProduct.material || "");

    formData.append("sizes", JSON.stringify(selectedProduct.sizes || []));
    formData.append("existingImages", JSON.stringify(selectedProduct.images || []));

    newImages.forEach((image) => {
      formData.append("images", image);
    });

    await api.put(`/products/update/${selectedProduct._id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (fetchProducts) fetchProducts();
    onClose();
  } catch (error) {
    console.error(error.response?.data);
  }
};
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Modify Product Information</DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
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
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              fullWidth
              type="number"
              label="Price (₹)"
              name="price"
              value={selectedProduct.price || ""}
              onChange={handleEditChange}
            />
            <TextField
              fullWidth
              label="Material"
              name="material"
              value={selectedProduct.material || ""}
              onChange={handleEditChange}
            />
          </Box>

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Description"
            name="description"
            value={selectedProduct.description || ""}
            onChange={handleEditChange}
          />

          {/* SIZES & QUANTITIES SELECTION GRID */}
          <Box
            sx={{
              border: "1px solid #e0e0e0",
              padding: "14px",
              borderRadius: "8px",
              background: "#fcfcfc",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justify: "space-between",
                alignItems: "center",
                mb: 1.5,
              }}
            >
              <FormLabel
                component="legend"
                sx={{ fontWeight: "bold", fontSize: "0.95rem", color: "#333" }}
              >
                Sizes & Quantities
              </FormLabel>
              <Typography
                variant="body2"
                sx={{ color: "#1976d2", fontWeight: 700 }}
              >
                Total Stock: {totalCalculatedStock} pcs
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "10px",
                maxHeight: "210px",
                overflowY: "auto",
                pr: 0.5,
              }}
            >
              {sizeOptions.map((s) => {
                const sizeData = (selectedProduct.sizes || []).find(
                  (item) => item.size === s
                );
                const isChecked = !!sizeData;

                return (
                  <Box
                    key={s}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: isChecked
                        ? "1px solid #1976d2"
                        : "1px solid #e0e0e0",
                      backgroundColor: isChecked ? "#f0f7ff" : "#ffffff",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={isChecked}
                          onChange={() => handleSizeToggle(s)}
                        />
                      }
                      label={
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "0.88rem",
                            fontWeight: isChecked ? 600 : 400,
                          }}
                        >
                          {s}
                        </Typography>
                      }
                      sx={{ margin: 0, flex: 1 }}
                    />
                    {isChecked && (
                      <TextField
                        size="small"
                        type="number"
                        placeholder="Qty"
                        value={sizeData.quantity || ""}
                        onChange={(e) =>
                          handleSizeQuantityChange(s, e.target.value)
                        }
                        InputProps={{
                          endAdornment: (
                            <InputAdornment
                              position="end"
                              sx={{
                                "& .MuiTypography-root": { fontSize: "0.75rem" },
                              }}
                            >
                              pcs
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          width: "95px",
                          "& .MuiInputBase-input": {
                            padding: "6px 8px",
                            fontSize: "0.85rem",
                          },
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* IMAGES SECTION */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
              Product Images
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
              {selectedProduct.images?.map((img, i) => (
                <Box
                  key={`existing-${i}`}
                  sx={{
                    position: "relative",
                    width: 70,
                    height: 70,
                    borderRadius: "6px",
                    overflow: "hidden",
                    border: "1px solid #ddd",
                  }}
                >
                  <img
                    src={img}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removeExistingImage(i)}
                    sx={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      color: "#fff",
                      padding: "2px",
                      "&:hover": { backgroundColor: "rgba(255,0,0,0.8)" },
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: "14px" }} />
                  </IconButton>
                </Box>
              ))}

              {previewImages.map((img, i) => (
                <Box
                  key={`new-${i}`}
                  sx={{
                    position: "relative",
                    width: 70,
                    height: 70,
                    borderRadius: "6px",
                    overflow: "hidden",
                    border: "1px solid #1976d2",
                  }}
                >
                  <img
                    src={img}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removeNewImage(i)}
                    sx={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      color: "#fff",
                      padding: "2px",
                      "&:hover": { backgroundColor: "rgba(255,0,0,0.8)" },
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: "14px" }} />
                  </IconButton>
                </Box>
              ))}
            </Box>

            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              size="small"
            >
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
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleUpdateSubmit}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProduct;