import React, { useState } from "react";
import { 
  Paper, TextField, Typography, Button, Box, Checkbox, 
  FormControlLabel, FormLabel, IconButton, 
  MenuItem, Autocomplete, InputAdornment 
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import api from "../../../api";
import "./AddProduct.css";

const AddProduct = ({ dynamicOptions = {}, refreshOptions }) => {
  const [product, setProduct] = useState({
    productName: "",
    productNumber: "",
    description: "",
    price: "",
    item: "",
    type: "",
    colors: "",
    collect: "",
    category: "",
    gender: "",
    part: "",
    material: "",
    sizes: [] // Stores array of objects: [{ size: "Small", quantity: 5 }]
  });

  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const sizeOptions = [
    "Small", "Medium", "Large", "XL", "XXL", 
    "2 inch", "3 inch", "4 inch", "5 inch", "12 inch", "24 inch","other"
  ];

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  // Toggle selection of a size
  const handleSizeToggle = (sizeName) => {
    const exists = product.sizes.some((s) => s.size === sizeName);
    let updatedSizes = [];

    if (exists) {
      // Remove size if unchecked
      updatedSizes = product.sizes.filter((s) => s.size !== sizeName);
    } else {
      // Add size with default quantity 0
      updatedSizes = [...product.sizes, { size: sizeName, quantity: 0 }];
    }

    setProduct({ ...product, sizes: updatedSizes });
  };

  // Update specific size quantity
  const handleSizeQuantityChange = (sizeName, quantityValue) => {
    const qty = Math.max(0, parseInt(quantityValue, 10) || 0);
    const updatedSizes = product.sizes.map((s) =>
      s.size === sizeName ? { ...s, quantity: qty } : s
    );
    setProduct({ ...product, sizes: updatedSizes });
  };

  // Automatically calculate total stock from size quantities
  const totalCalculatedStock = product.sizes.reduce(
    (acc, curr) => acc + (Number(curr.quantity) || 0), 0
  );

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setImages((prev) => [...prev, ...files]);
    setPreviewUrls((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (product.sizes.length === 0) {
      return toast.error("Please select at least one size option.");
    }

    const formData = new FormData();
    Object.keys(product).forEach((key) => {
      if (key === "sizes") {
        formData.append("sizes", JSON.stringify(product.sizes));
      } else if (key === "colors") {
        formData.append(
          "colors",
          JSON.stringify(
            product.colors ? product.colors.split(",").map((c) => c.trim()).filter(Boolean) : []
          )
        );
      } else {
        formData.append(key, product[key]);
      }
    });

    // Pass calculated total stock count
    formData.append("stockCount", totalCalculatedStock);

    images.forEach((img) => formData.append("images", img));

    try {
      const token = localStorage.getItem("token");
      await api.post("/products/add", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      toast.success("Product Created Successfully!");
      
      // Reset State
      setProduct({
        productName: "", productNumber: "", description: "", price: "",
        item: "", type: "", colors: "", collect: "", category: "",
        gender: "", part: "", material: "", sizes: []
      });
      setImages([]);
      setPreviewUrls([]);

      if (refreshOptions) refreshOptions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add product");
    }
  };

  return (
    <Paper className="split-layout-card" elevation={0} sx={{ maxHeight: "calc(100vh - 40px)", display: "flex", overflow: "hidden" }}>
      <Box className="form-column" sx={{ flex: 1, overflowY: "auto", pr: 2, display: "flex", flexDirection: "column" }}>
        <Box className="section-intro" sx={{ mb: 2 }}>
          <Typography variant="h5" className="main-title" sx={{ fontWeight: 600 }}>New Product</Typography>
          <Typography variant="caption" className="sub-title">Inventory Management</Typography>
        </Box>

        <form onSubmit={handleSubmit} className="product-form" style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
          <Box className="input-grid-2" sx={{ gap: "16px" }}>
            <TextField fullWidth label="Product Name" name="productName" value={product.productName} onChange={handleChange} required />
            <TextField fullWidth label="Product Number / SKU" name="productNumber" value={product.productNumber} onChange={handleChange} required />
          </Box>

          <Box className="input-grid-2" sx={{ gap: "16px" }}>
            <TextField fullWidth type="number" label="Price (₹)" name="price" value={product.price} onChange={handleChange} required />
            <TextField select fullWidth required label="Item Selection" name="item" value={product.item} onChange={handleChange}>
              <MenuItem value="">Select Item</MenuItem>
              {dynamicOptions?.items?.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </TextField>
          </Box>

          <Box className="input-grid-2" sx={{ gap: "16px" }}>
            <Autocomplete 
              fullWidth 
              options={dynamicOptions?.types || []} 
              value={product.type} 
              onChange={(e, nv) => setProduct({ ...product, type: nv || "" })} 
              renderInput={(params) => <TextField {...params} label="Product Type" required />} 
            />
            <TextField fullWidth label="Colors" name="colors" placeholder="Black, White" value={product.colors} onChange={handleChange} />
          </Box>

          <Box className="input-grid-2" sx={{ gap: "16px" }}>
            <TextField select fullWidth required label="Collection Selection" name="collect" value={product.collect} onChange={handleChange}>
              <MenuItem value="">Select Collection</MenuItem>
              {(dynamicOptions?.collects || dynamicOptions?.collect || []).map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </TextField>
            <TextField fullWidth label="Material" name="material" value={product.material} onChange={handleChange} />
          </Box>

          <Box className="input-grid-2" sx={{ gap: "16px" }}>
            <Autocomplete 
              fullWidth 
              options={dynamicOptions?.categories || []} 
              value={product.category} 
              onChange={(e, nv) => setProduct({ ...product, category: nv || "" })} 
              renderInput={(params) => <TextField {...params} label="Category" />} 
            />
            <TextField fullWidth label="Gender" name="gender" value={product.gender} onChange={handleChange} />
          </Box>

          <TextField fullWidth multiline rows={2} label="Description" name="description" value={product.description} onChange={handleChange} required />

          {/* SIZES & QUANTITIES SELECTION GRID */}
          <Box className="sizes-box" sx={{ border: "1px solid #e0e0e0", padding: "14px", borderRadius: "8px", background: "#fcfcfc" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <FormLabel component="legend" sx={{ fontWeight: "bold", fontSize: "0.95rem", color: "#333" }}>
                Sizes & Quantities
              </FormLabel>
              <Typography variant="body2" sx={{ color: "#1976d2", fontWeight: 700 }}>
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
                pr: 0.5
              }}
            >
              {sizeOptions.map((s) => {
                const sizeData = product.sizes.find((item) => item.size === s);
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
                      border: isChecked ? "1px solid #1976d2" : "1px solid #e0e0e0",
                      backgroundColor: isChecked ? "#f0f7ff" : "#ffffff",
                      transition: "all 0.2s ease"
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
                      label={<Typography variant="body2" sx={{ fontSize: "0.88rem", fontWeight: isChecked ? 600 : 400 }}>{s}</Typography>} 
                      sx={{ margin: 0, flex: 1 }}
                    />
                    {isChecked && (
                      <TextField
                        size="small"
                        type="number"
                        placeholder="Qty"
                        value={sizeData.quantity || ""}
                        onChange={(e) => handleSizeQuantityChange(s, e.target.value)}
                        InputProps={{ 
                          endAdornment: <InputAdornment position="end" sx={{ '& .MuiTypography-root': { fontSize: "0.75rem" } }}>pcs</InputAdornment> 
                        }}
                        sx={{ 
                          width: "95px", 
                          "& .MuiInputBase-input": { padding: "6px 8px", fontSize: "0.85rem" } 
                        }}
                        required
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* STICKY FOOTER FOR SUBMIT ACTION */}
          <Box sx={{ position: "sticky", bottom: 0, pt: 1.5, pb: 1, backgroundColor: "#ffffff", borderTop: "1px solid #f0f0f0", zIndex: 5, mt: "auto" }}>
            <Button type="submit" variant="contained" fullWidth className="submit-action-btn" sx={{ py: 1.2, fontSize: "0.95rem", fontWeight: "bold" }}>
              Add Product
            </Button>
          </Box>
        </form>
      </Box>

      {/* MEDIA PREVIEW COLUMN */}
      <Box className="gallery-column" sx={{ width: "320px", borderLeft: "1px solid #f0f0f0", pl: 2, display: "flex", flexDirection: "column" }}>
        <Box className="gallery-header" sx={{ mb: 1 }}>
          <AutoAwesomeIcon className="sparkle-icon" />
          <Typography variant="h6">Media Upload</Typography>
        </Box>

        <Box className="uploader-drop-zone" sx={{ mb: 2 }}>
          <input hidden multiple type="file" id="media-upload" accept="image/*" onChange={handleImages} />
          <label htmlFor="media-upload" style={{ cursor: "pointer", display: "block", textAlign: "center", padding: "16px" }}>
            <CloudUploadIcon className="upload-cloud-icon" />
            <Typography variant="body2">Click to upload assets</Typography>
          </label>
        </Box>

        <Box className="preview-scroll-container" sx={{ flex: 1, overflowY: "auto" }}>
          {previewUrls.map((url, idx) => (
            <Box key={idx} className="preview-thumbnail-wrapper">
              <img src={url} alt="Preview" className="thumbnail-image" />
              <IconButton size="small" className="delete-thumb-btn" onClick={() => removeImage(idx)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default AddProduct;