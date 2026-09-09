import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  Paper,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip
} from '@mui/material';
import DeleteOutlineIcon from "@mui/icons-material/Delete";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import api from '../../../api';
import { toast } from 'react-toastify';
import './OfferManagement.css';

const OfferManagement = () => {
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  const [isBannerActive, setIsBannerActive] = useState(true);

  const [filters, setFilters] = useState({
    category: '',
    item: '',
    type: '',
    gender: '',
    material: '',
    collect: ''
  });

  const [offerPercentage, setOfferPercentage] = useState('');
  const [editingProductId, setEditingProductId] = useState(null);

  const [options, setOptions] = useState({
    categories: [],
    items: [],
    types: [],
    collections: []
  });

  const [activeOffers, setActiveOffers] = useState([]);

  useEffect(() => {
    fetchOptions();
    fetchBanner();
    fetchActiveOffers();
  }, []);

  const fetchOptions = async () => {
    try {
      const response = await api.get('/attributes/form-options');
      if (response.data.success) {
        setOptions({
          categories: response.data.categories || [],
          items: response.data.items || [],
          types: response.data.types || [],
          collections: response.data.collects || []
        });
      }
    } catch (error) {
      console.error('Failed to fetch options', error);
      toast.error('Failed to load filter options');
    }
  };

  const fetchBanner = async () => {
    try {
      const response = await api.get('/offers/banner');
      if (response.data.success && response.data.banner) {
        setBannerUrl(response.data.banner.imageUrl);
        setIsBannerActive(response.data.banner.isActive);
      }
    } catch (error) {
      console.error('Failed to fetch banner', error);
    }
  };

  const fetchActiveOffers = async () => {
    try {
      const response = await api.get('/offers/active-products');
      if (response.data.success) {
        setActiveOffers(response.data.products);
      }
    } catch (error) {
      console.error('Failed to fetch active offers', error);
    }
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    if (!bannerFile && !bannerUrl) {
      return toast.warn('Please provide a banner image file');
    }

    try {
      const formData = new FormData();
      if (bannerFile) {
        formData.append('bannerImage', bannerFile);
      }
      formData.append('isActive', isBannerActive);

      if (bannerUrl && !bannerFile) {
        formData.append('imageUrl', bannerUrl);
      }

      const response = await api.post('/offers/banner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success('Offer banner updated successfully');
        if (response.data.banner) {
          setBannerUrl(response.data.banner.imageUrl);
          setBannerFile(null);
        }
      }
    } catch (error) {
      console.error('Error updating banner', error);
      toast.error('Failed to update banner');
    }
  };

  const handleBannerFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerUrl(URL.createObjectURL(file));
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyOffer = async (e) => {
    e.preventDefault();
    if (!offerPercentage || isNaN(offerPercentage) || offerPercentage <= 0 || offerPercentage > 100) {
      return toast.warn('Please provide a valid offer percentage (1-100)');
    }

    const cleanFilters = {};
    for (const key in filters) {
      if (filters[key]) {
        cleanFilters[key] = filters[key];
      }
    }

    try {
      const response = await api.post('/offers/apply', {
        filters: cleanFilters,
        offerPercentage: Number(offerPercentage),
        productId: editingProductId || undefined
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setEditingProductId(null);
        setOfferPercentage('');
        fetchActiveOffers();
      }
    } catch (error) {
      console.error('Error applying offer', error);
      toast.error('Failed to apply offer');
    }
  };

  const handleRemoveBulkOffer = async () => {
    const cleanFilters = {};
    for (const key in filters) {
      if (filters[key]) {
        cleanFilters[key] = filters[key];
      }
    }

    if (Object.keys(cleanFilters).length === 0) {
      if (!window.confirm("No filters selected. This will remove offers from ALL products. Are you sure?")) {
        return;
      }
    }

    try {
      const response = await api.post('/offers/remove', { filters: cleanFilters });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchActiveOffers();
      }
    } catch (error) {
      console.error('Error removing offer', error);
      toast.error('Failed to remove offer');
    }
  };

  const handleEditIndividual = (product) => {
    setEditingProductId(product._id);
    setOfferPercentage(product.offerPercentage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteIndividual = async (productId) => {
    if (!window.confirm("Are you sure you want to remove the offer from this product?")) {
      return;
    }
    try {
      const response = await api.post('/offers/remove', { productId });
      if (response.data.success) {
        toast.success('Offer removed successfully');
        fetchActiveOffers();
      }
    } catch (error) {
      console.error('Error removing product offer', error);
      toast.error('Failed to remove offer');
    }
  };

  return (
    <Box className="offer-management-container">
      <Typography variant="h5" className="page-title">
        Offer Management
      </Typography>

      <Grid container spacing={3}>
        {/* Banner Section */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} className="section-card">
            <Typography variant="subtitle1" className="section-title">
              Banner Settings
            </Typography>

            <form onSubmit={handleBannerSubmit} className="banner-form">
              <div className="file-upload-wrapper">
                <input
                  accept="image/*"
                  type="file"
                  id="banner-file-input"
                  onChange={handleBannerFileChange}
                  hidden
                />
                <label htmlFor="banner-file-input" className="file-upload-label">
                  <CloudUploadOutlinedIcon fontSize="small" />
                  <span>{bannerFile ? bannerFile.name : 'Upload Banner Image'}</span>
                </label>
              </div>

              {bannerUrl && (
                <Box className="banner-preview-box">
                  <img src={bannerUrl} alt="Offer Banner Preview" className="banner-preview-img" />
                </Box>
              )}

              <FormControlLabel
                control={
                  <Switch
                    checked={isBannerActive}
                    onChange={(e) => setIsBannerActive(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label={<Typography variant="body2">Active on Home Page</Typography>}
                className="banner-switch"
              />

              <Button
                type="submit"
                variant="contained"
                disableElevation
                className="btn-primary"
                fullWidth
              >
                Save Banner
              </Button>
            </form>
          </Paper>
        </Grid>

        {/* Offer Application Section */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} className="section-card">
            <Typography variant="subtitle1" className="section-title">
              {editingProductId ? 'Edit Single Product Offer' : 'Apply Bulk Offer'}
            </Typography>

            <form onSubmit={handleApplyOffer}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Collection</InputLabel>
                    <Select
                      name="collect"
                      value={filters.collect}
                      onChange={handleFilterChange}
                      label="Collection"
                      disabled={!!editingProductId}
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      {options.collections.map((c) => (
                        <MenuItem key={c._id} value={c.name}>{c.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                      label="Category"
                      disabled={!!editingProductId}
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      {options.categories.map((c) => (
                        <MenuItem key={c._id} value={c.name}>{c.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Item</InputLabel>
                    <Select
                      name="item"
                      value={filters.item}
                      onChange={handleFilterChange}
                      label="Item"
                      disabled={!!editingProductId}
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      {options.items.map((i) => (
                        <MenuItem key={i._id} value={i.name}>{i.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                      name="type"
                      value={filters.type}
                      onChange={handleFilterChange}
                      label="Type"
                      disabled={!!editingProductId}
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      {options.types.map((t) => (
                        <MenuItem key={t._id} value={t.name}>{t.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Gender</InputLabel>
                    <Select
                      name="gender"
                      value={filters.gender}
                      onChange={handleFilterChange}
                      label="Gender"
                      disabled={!!editingProductId}
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      <MenuItem value="Men">Men</MenuItem>
                      <MenuItem value="Women">Women</MenuItem>
                      <MenuItem value="Kids">Kids</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Offer Percentage (%)"
                    type="number"
                    value={offerPercentage}
                    onChange={(e) => setOfferPercentage(e.target.value)}
                    required
                    inputProps={{ min: 1, max: 100 }}
                  />
                </Grid>
              </Grid>

              <Box className="action-buttons-group">
                <Button
                  type="submit"
                  variant="contained"
                  disableElevation
                  className="btn-primary"
                  fullWidth
                >
                  {editingProductId ? 'Update Offer' : 'Apply Offer'}
                </Button>

                {editingProductId ? (
                  <Button
                    type="button"
                    variant="outlined"
                    className="btn-secondary"
                    fullWidth
                    onClick={() => {
                      setEditingProductId(null);
                      setOfferPercentage('');
                    }}
                  >
                    Cancel Edit
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outlined"
                    color="error"
                    className="btn-danger-outlined"
                    fullWidth
                    onClick={handleRemoveBulkOffer}
                  >
                    Bulk Remove
                  </Button>
                )}
              </Box>
            </form>
          </Paper>
        </Grid>
      </Grid>

      {/* Active Offers List Section */}
      <Box mt={4}>
        <Paper elevation={0} className="section-card">
          <Box className="table-header-box">
            <Typography variant="subtitle1" className="section-title">
              Active Offers
            </Typography>
            <span className="badge-count">{activeOffers.length} Products</span>
          </Box>

          {activeOffers.length > 0 ? (
            <div className="table-wrapper">
              <table className="minimal-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product Details</th>
                    <th>Category</th>
                    <th>Original</th>
                    <th>Discount</th>
                    <th>Final Price</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeOffers.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <img
                          src={product.images?.[0] || '/placeholder.jpg'}
                          alt={product.productName}
                          className="table-img"
                        />
                      </td>
                      <td>
                        <div className="product-name">{product.productName}</div>
                        <div className="product-code">{product.productNumber}</div>
                      </td>
                      <td className="text-secondary">{product.category || 'N/A'}</td>
                      <td className="price-original">₹{product.price}</td>
                      <td>
                        <span className="badge-discount">-{product.offerPercentage}%</span>
                      </td>
                      <td className="price-final">₹{product.discountedPrice}</td>
                      <td style={{ textAlign: 'right' }}>
                        <Tooltip title="Edit Offer">
                          <IconButton
                            size="small"
                            onClick={() => handleEditIndividual(product)}
                            className="action-btn edit-btn"
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove Offer">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteIndividual(product._id)}
                            className="action-btn delete-btn"
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Typography variant="body2" className="empty-state">
              No products currently have active offers.
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default OfferManagement;