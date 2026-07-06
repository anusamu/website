import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Container, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  CircularProgress, 
  Box, 
  Button,
  Breadcrumbs,
  Link
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const CategoryProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Extract the "?category=XYZ" query parameter from the URL string
  const queryParams = new URLSearchParams(location.search);
  const selectedCategory = queryParams.get("category");

 useEffect(() => {
  const fetchFilteredProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. CRITICAL FIX: Fetch your data from the database FIRST
      const res = await axios.get("http://localhost:5000/api/products");
      const allProducts = res.data || [];

      // 2. Filter dataset matching selectedCategory parameters explicitly
      if (selectedCategory) {
        const cleanSearchCategory = selectedCategory.trim().toLowerCase();
        
        const filtered = allProducts.filter((product) => {
          if (!product) return false;

          // Robust check: Handles if category is stored as a String or an Object
          const productCat = typeof product.category === "object" 
            ? (product.category.name || product.category.title) 
            : (product.category || product.categoryName);
            
          return productCat?.toString().trim().toLowerCase() === cleanSearchCategory;
        });
        
        setProducts(filtered);
      } else {
        // Fallback safely to showing all entries if no target filter is passed in URL
        setProducts(allProducts);
      }
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  fetchFilteredProducts();
}, [selectedCategory]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress color="primary" size={50} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Navigation Breadcrumbs & Back Actions */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link component="button" variant="body2" onClick={() => navigate("/")} underline="hover" color="inherit">
            Home
          </Link>
          <Typography color="text.primary" variant="body2">
            {selectedCategory ? selectedCategory : "All Products"}
          </Typography>
        </Breadcrumbs>

        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate("/")} 
          variant="outlined" 
          size="small"
        >
          Back to Home
        </Button>
      </Box>

      {/* Dynamic Section Header Title */}
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        {selectedCategory ? `${selectedCategory} Collection` : "Our Entire Catalogue"}
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Showing {products.length} elegant items matching your selection.
      </Typography>

      {error && (
        <Typography color="error" textAlign="center" my={4}>{error}</Typography>
      )}

      {/* Products Display Grid */}
      {products.length > 0 ? (
        <Grid container spacing={3}>
          {products.map((product) => {
            const displayImage = product.images?.[0] || 'https://via.placeholder.com/300x400?text=No+Image';
            
            return (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 2, '&:hover': { boxShadow: 6 } }}>
                  <CardMedia
                    component="img"
                    height="320"
                    image={displayImage}
                    alt={product.productName}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" gutterBottom>
                      {product.productNumber}
                    </Typography>
                    <Typography variant="h6" component="h2" noWrap gutterBottom>
                      {product.productName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
                      {product.description}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" color="primary.main" fontWeight="bold">
                        ₹{product.price}
                      </Typography>
                      <Button variant="contained" size="small" color="secondary">
                        View Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No products found under the "{selectedCategory}" collection.
          </Typography>
          <Button variant="contained" onClick={() => navigate("/")} sx={{ mt: 2 }}>
            Continue Shopping
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default CategoryProducts;