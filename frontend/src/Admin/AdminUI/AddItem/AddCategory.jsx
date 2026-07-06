import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  Paper, 
  TextField, 
  Typography, 
  Button, 
  Box, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  CircularProgress 
} from "@mui/material";
import CategoryIcon from "@mui/icons-material/Category";
import "./AttributeCard.css";

// 1. Added dynamicOptions to props
const AddCategory = ({ dynamicOptions = {}, refreshOptions }) => {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state for network requests

  const handleSave = async () => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return toast.error("Please enter a valid Category name");
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/attributes/category", 
        { name: trimmedValue }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        toast.success("New Catalog Category tag recorded!");
        setValue("");
        if (typeof refreshOptions === "function") {
          refreshOptions(); // Refreshes parent component state instantly
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register Category");
    } finally {
      setLoading(false);
    }
  };

  // Safe fallback to isolate the categories array
  const categoriesList = dynamicOptions?.categories || [];

  return (
    <Paper className="isolated-attribute-card" elevation={0}>
      <Box className="attribute-view-header">
        <CategoryIcon className="header-view-icon" />
        <Typography variant="h5" className="main-title">Create Dynamic Catalog Category Tier</Typography>
        <Typography variant="body2" className="sub-title">Inject contextual collection groups to map out filtering queries for navigation paths</Typography>
      </Box>
      
      <Box className="inline-entry-field-row" display="flex" gap={2} alignItems="center">
        <TextField 
          fullWidth 
          label="New Category Name" 
          placeholder="e.g., Summer Essentials" 
          value={value} 
          onChange={(e) => setValue(e.target.value)} 
          onKeyDown={(e) => e.key === "Enter" && handleSave()} // Allows quick submissions with Enter key
          disabled={loading}
        />
        <Button 
          variant="contained" 
          className="isolated-save-btn" 
          onClick={handleSave}
          disabled={loading}
          style={{ minWidth: '150px', height: '56px' }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Save Category"}
        </Button>
      </Box>

      {/* Existing Categories List Panel */}
      <Box className="existing-items-section" sx={{ mt: 3 }}>
        <Typography variant="subtitle2" className="list-section-title">
          Existing Categories ({categoriesList.length})
        </Typography>
        <Divider sx={{ my: 1.5 }} />
        
        {categoriesList.length > 0 ? (
          <List className="attribute-display-list-vertical">
            {categoriesList.map((categoryItem, index) => {
              // Safely evaluates unique key constraints for both string & object array types
              const categoryKey = categoryItem._id || categoryItem.id || `category-${index}`;
              const categoryText = typeof categoryItem === "object" ? categoryItem.name : categoryItem;

              return (
                <ListItem key={categoryKey} className="attribute-list-item-row">
                  <ListItemText primary={categoryText} />
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Typography variant="body2" className="empty-list-text" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            No catalog category tiers registered yet.
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default AddCategory;