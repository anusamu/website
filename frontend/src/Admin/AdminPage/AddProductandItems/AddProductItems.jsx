import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";

// Icons
import AddBoxIcon from "@mui/icons-material/AddBox";
import CategoryIcon from "@mui/icons-material/Category";
import LayersIcon from "@mui/icons-material/Layers";
import LabelIcon from "@mui/icons-material/Label";
import CollectionsIcon from "@mui/icons-material/Collections"; 

// Children Panel Imports
import AddProductForm from "../../AdminUI/AddProduct/AddProduct";
import AddItem from "../../AdminUI/AddItem/AddItem";
import AddType from "../../AdminUI/AddItem/AddType";
import AddCategory from "../../AdminUI/AddItem/AddCategory";
import AddCollection from "../../AdminUI/AddItem/AddCollection"; 

import "./AddProductItems.css";
import api from "../../../api";

const AddProductItems = () => {
  const [activeTab, setActiveTab] = useState("product");
  const [dynamicOptions, setDynamicOptions] = useState({ 
    categories: [], 
    items: [], 
    types: [], 
    collect: [] // Initialized key matching state change requirements
  });

  const fetchAttributes = async () => {
    try {
      const res = await api.get("attributes/form-options");
      if (res.data.success) {
        setDynamicOptions({
          categories: (res.data.categories || []).map((c) => c.name),
          items: (res.data.items || []).map((i) => i.name),
          types: (res.data.types || []).map((t) => t.name),
          // Maps backend collections structure directly into your collect hook variable array
          collect: (res.data.collects || res.data.collect || []).map((col) => col.name)
        });
      }
    } catch (err) {
      console.error("Error loading dropdown attributes:", err);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  return (
    <Box className="panel-workspace-container">
      <Box className="workspace-action-nav">
        <Typography variant="button" className="nav-group-header">Inventory Control</Typography>
        <List component="nav" className="nav-buttons-stack">
          <ListItemButton selected={activeTab === "product"} onClick={() => setActiveTab("product")} className="nav-panel-big-btn">
            <ListItemIcon><AddBoxIcon className="action-panel-icon" /></ListItemIcon>
            <ListItemText primary="Add Product" secondary="Catalog Entry" />
          </ListItemButton>

          <ListItemButton selected={activeTab === "collection"} onClick={() => setActiveTab("collect")} className="nav-panel-big-btn">
            <ListItemIcon><CollectionsIcon className="action-panel-icon" /></ListItemIcon>
            <ListItemText primary="Add Collection" secondary="Store Segments" />
          </ListItemButton>

          <ListItemButton selected={activeTab === "item"} onClick={() => setActiveTab("item")} className="nav-panel-big-btn">
            <ListItemIcon><LayersIcon className="action-panel-icon" /></ListItemIcon>
            <ListItemText primary="Add Item" secondary="Root Divisions" />
          </ListItemButton>

          <ListItemButton selected={activeTab === "type"} onClick={() => setActiveTab("type")} className="nav-panel-big-btn">
            <ListItemIcon><LabelIcon className="action-panel-icon" /></ListItemIcon>
            <ListItemText primary="Add Type" secondary="Sub-Classifications" />
          </ListItemButton>

          <ListItemButton selected={activeTab === "category"} onClick={() => setActiveTab("category")} className="nav-panel-big-btn">
            <ListItemIcon><CategoryIcon className="action-panel-icon" /></ListItemIcon>
            <ListItemText primary="Add Category" secondary="Marketing Tags" />
          </ListItemButton>
        </List>
      </Box>

      <Box className="workspace-dynamic-viewport">
        {activeTab === "product" && (
          <AddProductForm dynamicOptions={dynamicOptions} refreshOptions={fetchAttributes} />
        )}

        {activeTab === "collect" && (
          <AddCollection dynamicOptions={dynamicOptions} refreshOptions={fetchAttributes} />
        )}

        {activeTab === "item" && (
          <AddItem dynamicOptions={dynamicOptions} refreshOptions={fetchAttributes} />
        )}

        {activeTab === "type" && (
          <AddType dynamicOptions={dynamicOptions} refreshOptions={fetchAttributes} />
        )}

        {activeTab === "category" && (
          <AddCategory dynamicOptions={dynamicOptions} refreshOptions={fetchAttributes} />
        )}
      </Box>
    </Box>
  );
};

export default AddProductItems;