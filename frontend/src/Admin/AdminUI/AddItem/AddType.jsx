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
import LabelIcon from "@mui/icons-material/Label";
import "./AttributeCard.css";

// 1. Added dynamicOptions here as a prop
const AddType = ({ dynamicOptions = {}, refreshOptions }) => {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state for UX

  const handleSave = async () => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return toast.error("Please enter a valid Type name");
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/attributes/type", 
        { name: trimmedValue }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        toast.success("New Product Type recorded!");
        setValue("");
        if (typeof refreshOptions === "function") {
          refreshOptions();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register Type");
    } finally {
      setLoading(false);
    }
  };

  // Safe fallback to read types array
  const typesList = dynamicOptions?.types || [];

  return (
    <Paper className="isolated-attribute-card" elevation={0}>
      <Box className="attribute-view-header">
        <LabelIcon className="header-view-icon" />
        <Typography variant="h5" className="main-title">Create Product Sub-Type Relation</Typography>
        <Typography variant="body2" className="sub-title">Add specialized product categories directly tied into dropdown forms (e.g., Sneakers, T-Shirt)</Typography>
      </Box>
      
      <Box className="inline-entry-field-row" display="flex" gap={2} alignItems="center">
        <TextField 
          fullWidth 
          label="New Type Name" 
          placeholder="e.g., T-Shirt" 
          value={value} 
          onChange={(e) => setValue(e.target.value)} 
          onKeyDown={(e) => e.key === "Enter" && handleSave()} // Save on enter
          disabled={loading}
        />
        <Button 
          variant="contained" 
          className="isolated-save-btn" 
          onClick={handleSave}
          disabled={loading}
          style={{ minWidth: '120px', height: '56px' }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Save Type"}
        </Button>
      </Box>

      {/* Existing Items List Panel */}
      <Box className="existing-items-section" sx={{ mt: 3 }}>
        <Typography variant="subtitle2" className="list-section-title">
          Existing Types ({typesList.length})
        </Typography>
        <Divider sx={{ my: 1.5 }} />
        
        {typesList.length > 0 ? (
          <List className="attribute-display-list-vertical">
            {typesList.map((typeItem, index) => {
              // Gracefully handles both string arrays and object arrays from the backend
              const typeKey = typeItem._id || typeItem.id || `type-${index}`;
              const typeText = typeof typeItem === "object" ? typeItem.name : typeItem;

              return (
                <ListItem key={typeKey} className="attribute-list-item-row">
                  <ListItemText primary={typeText} />
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Typography variant="body2" className="empty-list-text" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            No product sub-types registered yet.
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default AddType;