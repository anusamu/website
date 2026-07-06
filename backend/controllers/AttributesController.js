const { Category, Item, Type,
    //  Variant

 } = require('../models/Attributes');

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

// --- FETCH ALL ATTRIBUTES FOR FRONTEND DROPDOWNS ---
// Call this endpoint when the "Add Product" page loads

exports.getProductFormAttributes = async (req, res) => {
  try {
    const [categories, items, types, variants] = await Promise.all([
      Category.find(),
      Item.find(),
      Type.find(),
    //   Variant.find()
    ]);
    res.status(200).json({
      success: true,
      categories,
      items,
      types,
    //   variants
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};