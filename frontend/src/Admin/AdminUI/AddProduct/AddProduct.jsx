import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Paper, TextField, Typography, Button, Box, Checkbox, FormControlLabel, FormGroup, FormLabel, IconButton, MenuItem, Autocomplete } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DeleteIcon from "@mui/icons-material/Delete";
import "./AddProduct.css";
import api from "../../../api";

// Added a safety fallback default value to dynamicOptions to avoid initial undefined errors
const AddProduct = ({ dynamicOptions = {}, refreshOptions }) => {
  const [product, setProduct] = useState({
    productName: "", productNumber: "", description: "", price: "", item: "",
    type: "", colors: "", brand: "", category: "", gender: "", part: "", stockCount: "", sizes: []
  });
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleChange = (e) => setProduct({ ...product, [e.target.name]: e.target.value });

  const handleSize = (e) => {
    const value = e.target.value;
    setProduct({
      ...product,
      sizes: e.target.checked ? [...product.sizes, value] : product.sizes.filter((s) => s !== value)
    });
  };

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
    const formData = new FormData();
    Object.keys(product).forEach((key) => {
      if (key === "sizes") formData.append("sizes", JSON.stringify(product.sizes));
      else if (key === "colors") formData.append("colors", JSON.stringify(product.colors.split(",").map(c => c.trim()).filter(Boolean)));
      else formData.append(key, product[key]);
    });
    images.forEach((img) => formData.append("images", img));

    try {
      const token = localStorage.getItem("token");
      await api.post("/products/add", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      toast.success("Product Created Successfully");
      setProduct({ productName: "", productNumber: "", description: "", price: "", item: "", type: "", colors: "", brand: "", category: "", gender: "", part: "", stockCount: "", sizes: [] });
      setImages([]); setPreviewUrls([]);
      
      // Refresh options after submission if needed
      if (refreshOptions) refreshOptions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add product");
    }
  };

  return (
    <Paper className="split-layout-card" elevation={0}>
      <Box className="form-column">
        <Box className="section-intro">
          <Typography variant="h5" className="main-title">New Product</Typography>
          <Typography variant="caption" className="sub-title">Inventory Management</Typography>
        </Box>
        <form onSubmit={handleSubmit} className="product-form">
          <Box className="input-grid-2">
            <TextField fullWidth label="Product Name" name="productName" value={product.productName} onChange={handleChange} required />
            <TextField fullWidth label="Product Number / SKU" name="productNumber" value={product.productNumber} onChange={handleChange} required />
          </Box>
          <Box className="input-grid-2">
            <TextField fullWidth type="number" label="Price (₹)" name="price" value={product.price} onChange={handleChange} required />
            <TextField fullWidth type="number" label="Stock Inventory" name="stockCount" value={product.stockCount} onChange={handleChange} required />
          </Box>
          <Box className="input-grid-2">
            <TextField select fullWidth required label="Item Selection" name="item" value={product.item} onChange={handleChange}>
              <MenuItem value="">Select Item</MenuItem>
              {/* Added safe navigation ? to items */}
              {dynamicOptions?.items?.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </TextField>
            
            {/* Added safety fallback array to options for types */}
            <Autocomplete 
              fullWidth 
              options={dynamicOptions?.types || []} 
              value={product.type} 
              onChange={(e, nv) => setProduct({ ...product, type: nv || "" })} 
              renderInput={(params) => <TextField {...params} label="Product Type" required />} 
            />
          </Box>
          <Box className="input-grid-2">
            <TextField fullWidth label="Colors" name="colors" placeholder="Black, White" value={product.colors} onChange={handleChange} />
            <TextField fullWidth label="Brand" name="brand" value={product.brand} onChange={handleChange} />
          </Box>
          <Box className="input-grid-2">
            {/* Added safety fallback array to options for categories */}
            <Autocomplete 
              fullWidth 
              options={dynamicOptions?.categories || []} 
              value={product.category} 
              onChange={(e, nv) => setProduct({ ...product, category: nv || "" })} 
              renderInput={(params) => <TextField {...params} label="Category" />} 
            />
            <TextField fullWidth label="Gender" name="gender" value={product.gender} onChange={handleChange} />
          </Box>
          <TextField fullWidth multiline rows={3} label="Description" name="description" value={product.description} onChange={handleChange} required />
          <Box className="sizes-box">
            <FormLabel>Sizes</FormLabel>
            <FormGroup row>
              {["Small", "Medium", "Large", "XL"].map((s) => (
                <FormControlLabel key={s} control={<Checkbox checked={product.sizes.includes(s)} value={s} onChange={handleSize} />} label={s} />
              ))}
            </FormGroup>
          </Box>
          <Button type="submit" variant="contained" className="submit-action-btn">Add Product</Button>
        </form>
      </Box>
      <Box className="gallery-column">
        <Box className="gallery-header">
          <AutoAwesomeIcon className="sparkle-icon" />
          <Typography variant="h6">Media Upload</Typography>
        </Box>
        <Box className="uploader-drop-zone">
          <input hidden multiple type="file" id="media-upload" accept="image/*" onChange={handleImages} />
          <label htmlFor="media-upload">
            <CloudUploadIcon className="upload-cloud-icon" />
            <Typography>Click to upload assets</Typography>
          </label>
        </Box>
        <Box className="preview-scroll-container">
          {previewUrls.map((url, idx) => (
            <Box key={idx} className="preview-thumbnail-wrapper">
              <img src={url} alt="Preview" className="thumbnail-image" />
              <IconButton size="small" className="delete-thumb-btn" onClick={() => removeImage(idx)}><DeleteIcon fontSize="small" /></IconButton>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default AddProduct;