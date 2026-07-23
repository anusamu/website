
const mongoose = require('mongoose')
const Product = require("../models/Product");

// 1. ADD PRODUCT
exports.addProduct = async (req, res) => {
  try {
    const {
      productName,
      productNumber,
      description,
      price,
      item,
      type,
      colors,
      collect,
      category,
      gender,
      part,
      material,
      sizes,
    } = req.body;

    // Cloudinary Image Fallback
    const imageUrls = req.files
      ? req.files.map((file) => file.path || file.secure_url)
      : [];

    // Parse Colors
    let processedColors = [];
    if (colors) {
      try {
        processedColors = typeof colors === "string" ? JSON.parse(colors) : colors;
      } catch {
        processedColors = colors.split(",").map((c) => c.trim());
      }
    }

    // Parse Sizes Array of Objects [{ size: "Small", quantity: 5 }, ...]
    let processedSizes = [];
    if (sizes) {
      try {
        processedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
      } catch (e) {
        processedSizes = [];
      }
    }

    // Clean and validate processed sizes
    if (Array.isArray(processedSizes)) {
      processedSizes = processedSizes.map((s) => ({
        size: String(s.size).trim(),
        quantity: Math.max(0, Number(s.quantity) || 0),
      }));
    } else {
      processedSizes = [];
    }

    // Calculate total stock count strictly from sizes array
    const calculatedStockCount = processedSizes.reduce(
      (total, s) => total + (s.quantity || 0),
      0
    );

    // Calculate dynamic inventory status
    let stockStatus = "Out Of Stock";
    if (calculatedStockCount > 5) {
      stockStatus = "In Stock";
    } else if (calculatedStockCount >= 1 && calculatedStockCount <= 5) {
      stockStatus = "Few Stock Available";
    } else {
      stockStatus = "Out Of Stock";
    }

    // Create and save Product instance
    const product = await Product.create({
      productName,
      productNumber,
      description,
      price: Number(price),
      item,
      type,
      colors: processedColors,
      collect,
      category,
      gender,
      part,
      material,
      images: imageUrls,
      sizes: processedSizes,
      stockCount: calculatedStockCount,
      stockStatus,
    });

    return res.status(201).json({ success: true, product });
  } catch (error) {
    console.error("CRITICAL ADD PRODUCT ERROR:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET ACTIVE PRODUCTS (CLIENT-SIDE)
exports.getProducts = async (req, res) => {
  try {
    const { category, item, type, collect, gender, search } = req.query;

    let query = {};

    // Strictly enforce active status for user-side requests
    query.status = "active";

    if (category) query.category = category;
    if (item) query.item = item;
    if (type) query.type = type;
    if (collect) query.collect = collect;
    if (gender) query.gender = gender;

    // Search by product name or product number
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: "i" } },
        { productNumber: { $regex: search, $options: "i" } }
      ];
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    console.error("❌ GET ALL PRODUCTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product list."
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Check if the ID is a valid 24-character hex string
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid Product ID format" 
      });
    }

    // 2. Fetch product only if it exists AND its status is active
    const product = await Product.findOne({ _id: id, status: "active" });

    // 3. Return 404 if product doesn't exist or is inactive
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found or is currently unavailable" 
      });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Database Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
// 3. GET ALL PRODUCTS (ADMIN DASHBOARD)
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const {
      productName,
      productNumber,
      description,
      price,
      item,
      collect,
      category,
      type,
      gender,
      part,
      material,
    } = req.body;

    // Process images
    let updatedImages = existingProduct.images;
    if (req.body.existingImages) {
      try {
        let imgs = req.body.existingImages;
        while (typeof imgs === "string") {
          imgs = JSON.parse(imgs);
        }
        updatedImages = Array.isArray(imgs) ? imgs : [];
      } catch (err) {
        updatedImages = [];
      }
    }

    if (req.files?.length) {
      const newImages = req.files.map((file) => file.path || file.secure_url);
      updatedImages.push(...newImages);
    }

    // Parse Sizes Safely
    let updatedSizes = [];
    if (req.body.sizes) {
      let parsed = req.body.sizes;
      try {
        while (typeof parsed === "string") {
          parsed = JSON.parse(parsed);
        }
      } catch (err) {}

      if (Array.isArray(parsed)) {
        updatedSizes = parsed.map((s) => ({
          size: String(s.size || "").trim(),
          quantity: Math.max(0, parseInt(s.quantity, 10) || 0),
        })).filter((s) => s.size.length > 0);
      }
    }

    // Calculate dynamic stock
    const calculatedStock = updatedSizes.reduce(
      (acc, curr) => acc + (Number(curr.quantity) || 0),
      0
    );

    let stockStatus = "Out Of Stock";
    if (calculatedStock > 5) {
      stockStatus = "In Stock";
    } else if (calculatedStock >= 1 && calculatedStock <= 5) {
      stockStatus = "Few Stock Available";
    }

    // Prepare update object — fallback to existing values if field is undefined/empty string
    const updateData = {
      productName: productName || existingProduct.productName,
      productNumber: productNumber || existingProduct.productNumber,
      description: description || existingProduct.description,
      price: price !== undefined && price !== "" ? Number(price) : existingProduct.price,
      item: item || existingProduct.item,
      collect: collect || existingProduct.collect,
      category: category || existingProduct.category,
      type: type || existingProduct.type,
      gender: gender || existingProduct.gender,
      part: part || existingProduct.part,
      material: material || existingProduct.material,
      stockCount: calculatedStock,
      stockStatus,
      sizes: updatedSizes,
      images: updatedImages,
    };

    const product = await Product.findByIdAndUpdate(id, updateData, {
      returnDocument: "after", // Replaces deprecated `new: true`
      runValidators: true,
    });

    res.status(200).json(product);
  } catch (error) {
    console.error("CRITICAL BACKEND ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. CHANGE PRODUCT AVAILABILITY STATUS
exports.changeStatus = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { returnDocument: "after" }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, message: "Product Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Example Product Controller method targeting product display logic
exports.getProductsForShop = async (req, res) => {
  try {
    const { category, collection, filter } = req.query;

    // 1. Enforce active status by default for all shop queries
    let queryCondition = { status: "active" };

    // 2. Filter by Category if provided
    if (category) {
      queryCondition.category = category; 
    }

    // 3. Filter by Seasonal/Special Collection if provided
    if (collection) {
      queryCondition.collect = collection; // Matches `collect` in Product schema
    }

    // Initialize base query with condition
    let query = Product.find(queryCondition);

    // 4. Handle "New Arrivals" filter
    if (filter === 'newest') {
      query = query.sort({ createdAt: -1 }).limit(20);
    }

    const products = await query.exec();
    
    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};;