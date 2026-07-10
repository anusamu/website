const { Category, Item, Type, Material, Collect,
    //  Variant

 } = require('../models/Attributes');
const mongoose = require('mongoose')
const Product = require("../models/Product");
// --- CATEGORY CONTROLLERS ---
exports.addCategory = async (req, res) => {
  try {
    const category = await Category.create({ name: req.body.name });
    res.status(201).json({ success: true, data: category });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

// --- ITEM CONTROLLERS ---
exports.addItem = async (req, res) => {
  try {
    const item = await Item.create({ name: req.body.name });
    res.status(201).json({ success: true, data: item });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

// --- TYPE CONTROLLERS (e.g., Saree, T-Shirt) ---
exports.addType = async (req, res) => {
  try {
    const type = await Type.create({ name: req.body.name });
    res.status(201).json({ success: true, data: type });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

// --- VARIANT CONTROLLERS ---
// exports.addVariant = async (req, res) => {
//   try {
//     const variant = await Variant.create({ name: req.body.name });
//     res.status(201).json({ success: true, data: variant });
//   } catch (err) { res.status(400).json({ success: false, message: err.message }); }
// };
exports.addCollect = async (req, res) => {
  try {
    const collect = await Collect.create({ name: req.body.name });
    res.status(201).json({ success: true, data: collect});
  } catch (err) { 
    res.status(400).json({ success: false, message: err.message }); 
  }
};

// --- FETCH ALL ATTRIBUTES FOR FRONTEND DROPDOWNS ---
// Call this endpoint when the "Add Product" page loads

exports.getProductFormAttributes = async (req, res) => {
  try {
    const [categories, items, types, materials, collects] = await Promise.all([
      Category.find(),
      Item.find(),
      Type.find(),
      Material.find(),
      Collect.find()
    ]);
    
    res.status(200).json({
      success: true,
      categories,
      items,
      types,
      materials,    // Normalized to plural array names
      collects  // Normalized to plural array names
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// Add this to your backend product controller (e.g., controllers/productController.js)
exports.getSimilarProducts = async (req, res) => {
  try {
    const { item, excludeId } = req.query;

    if (!item) {
      return res.status(400).json({ success: false, message: "Item type query parameter is required." });
    }

    // Build the query safely
    const query = { item: item };

    // Only apply the exclusion filter if a valid ObjectId string was passed
    if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
      query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
    }

    // Find similar items
    const products = await Product.find(query).limit(4);

    return res.status(200).json({
      success: true,
      products
    });
  } catch (err) {
    console.error("Error in getSimilarProducts backend:", err.message); // This will log the exact crash reason to your terminal console
    return res.status(500).json({ success: false, message: err.message });
  }
};