import React, { useState } from "react";
import { toast } from "react-toastify";
import { Paper, TextField, Typography, Button, Box, List, ListItem, ListItemText, Divider, CircularProgress } from "@mui/material";
import LayersIcon from "@mui/icons-material/Layers";
import "./AttributeCard.css";
import api from "../../../api";

const AddCollection = ({ dynamicOptions = {}, refreshOptions }) => {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return toast.error("Please enter a valid Collect name");
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        "/attributes/collect", // Changed endpoint parameter from collection to collect
        { name: trimmedValue }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        toast.success("New Collect Group recorded!");
        setValue("");
        if (typeof refreshOptions === "function") {
          refreshOptions(); 
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register Collect");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  // Maps arrays consistently to the new 'collects' or 'collect' state names
  const collectsList = dynamicOptions?.collects || dynamicOptions?.collect || [];

  return (
    <Paper className="isolated-attribute-card" elevation={0}>
      <Box className="attribute-view-header">
        <LayersIcon className="header-view-icon" />
        <Typography variant="h5" className="main-title">Create Collect Group</Typography>
        <Typography variant="body2" className="sub-title">Register top-level parent segments across your store database (e.g., Wedding Collection, Festive Collection)</Typography>
      </Box>
      
      <Box className="inline-entry-field-row" display="flex" gap={2} alignItems="center">
        <TextField 
          fullWidth 
          label="New Collect Name" 
          placeholder="e.g., Wedding Collection" 
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
          style={{ minWidth: '135px', height: '56px' }} 
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Save Collect"}
        </Button>
      </Box>

      {/* Existing Collects List Panel */}
      <Box className="existing-items-section" sx={{ mt: 3 }}>
        <Typography variant="subtitle2" className="list-section-title">
          Existing Collects ({collectsList.length})
        </Typography>
        <Divider sx={{ my: 1.5 }} />
        
        {collectsList.length > 0 ? (
          <List className="attribute-display-list-vertical">
            {collectsList.map((collectItem, index) => {
              const collectKey = collectItem?._id || collectItem?.id || `collect-${index}`;
              const collectText = typeof collectItem === "object" ? collectItem.name : collectItem;

              return (
                <ListItem key={collectKey} className="attribute-list-item-row">
                  <ListItemText primary={collectText} />
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Typography variant="body2" className="empty-list-text" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
            No collect groups registered yet.
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default AddCollection;