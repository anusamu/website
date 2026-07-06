import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Paper, TextField, Typography, Button, Box, List, ListItem, ListItemText, Divider, CircularProgress } from "@mui/material";
import LayersIcon from "@mui/icons-material/Layers";
import "./AttributeCard.css";

const AddItem = ({ dynamicOptions = {}, refreshOptions }) => {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state for better UX

  const handleSave = async () => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return toast.error("Please enter a valid Item name");
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/attributes/item", 
        { name: trimmedValue }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        toast.success("New Item Group recorded!");
        setValue("");
        if (typeof refreshOptions === "function") {
          refreshOptions(); // Safely call parent refresh
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register Item");
    } finally {
      setLoading(false);
    }
  };

  // Allow users to press 'Enter' to save
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  const itemsList = dynamicOptions?.items || [];

  return (
    <Paper className="isolated-attribute-card" elevation={0}>
      <Box className="attribute-view-header">
        <LayersIcon className="header-view-icon" />
        <Typography variant="h5" className="main-title">Create Item Classification Group</Typography>
        <Typography variant="body2" className="sub-title">Register top-level parent segments across your database (e.g., Topwear, Footwear)</Typography>
      </Box>
      
      <Box className="inline-entry-field-row" display="flex" gap={2} alignItems="center">
        <TextField 
          fullWidth 
          label="New Item Name" 
          placeholder="e.g., Footwear" 
          value={value} 
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <Button 
          variant="contained" 
          className="isolated-save-btn" 
          onClick={handleSave}
          disabled={loading}
          style={{ minWidth: '120px', height: '56px' }} // Matches standard MUI TextField height
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Save Item"}
        </Button>
      </Box>

      {/* Existing Items List Panel */}
      <Box className="existing-items-section" sx={{ mt: 3 }}>
        <Typography variant="subtitle2" className="list-section-title">
          Existing Items ({itemsList.length})
        </Typography>
        <Divider sx={{ my: 1.5 }} />
        
        {itemsList.length > 0 ? (
          <List className="attribute-display-list-vertical">
            {itemsList.map((item, index) => {
              // Handle both object arrays [{_id: '1', name: 'Shoes'}] and string arrays ['Shoes'] safely
              const itemKey = item._id || item.id || `item-${index}`;
              const itemText = typeof item === "object" ? item.name : item;

              return (
                <ListItem key={itemKey} className="attribute-list-item-row">
                  <ListItemText primary={itemText} />
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Typography variant="body2" className="empty-list-text" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            No item classification groups registered yet.
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default AddItem;