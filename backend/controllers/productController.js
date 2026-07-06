const Product = require("../models/Product");

// 1. ADD PRODUCT
exports.addProduct = async (req, res) => {
  try {
    const {
      productName,
      productNumber,
      description,
      price,
      item,       // Populated dynamically from dropdown
      type,       // Populated dynamically from dropdown (e.g., Saree)
      colors,
      brand,
      category,   // Populated dynamically from dropdown
      gender,
      part,
      stockCount,
      sizes,
    } = req.body;

    // Cloudinary Image Fallback
    const imageUrls = req.files
      ? req.files.map((file) => file.path || file.secure_url)
      : [];

    let processedColors = [];
    if (colors) {
      try {
        processedColors = typeof colors === "string" ? JSON.parse(colors) : colors;
      } catch {
        processedColors = colors.split(",").map(c => c.trim());
      }
    }

    // Process Sizes array securely
    let processedSizes = [];
    if (sizes) {
      try {
        let parsed = sizes;
        while (typeof parsed === "string") {
          parsed = JSON.parse(parsed);
        }

        if (Array.isArray(parsed)) {
          processedSizes = parsed.flat(Infinity).map((s) => String(s).trim());
        } else if (typeof parsed === "object" && parsed !== null) {
          processedSizes = Object.values(parsed).map((s) => String(s).trim());
        } else {
          processedSizes = [String(parsed).trim()];
        }
      } catch (e) {
        processedSizes = typeof sizes === "string" ? sizes.split(",").map((s) => s.trim()) : sizes;
      }
    }

    // Clean up strings inside sizes
    processedSizes = processedSizes.filter((s) => typeof s === "string" && s.length > 0);

    // Calculate dynamic inventory status
    let stockStatus = "Out Of Stock";
    const count = Number(stockCount);

    if (count > 5) {
      stockStatus = "In Stock";
    } else if (count >= 1 && count <= 5) {
      stockStatus = "Few Stock Available";
    } else {
      stockStatus = "Out Of Stock";
    }

    // Save instance matching modified schema definitions
    const product = await Product.create({
      productName,
      productNumber,
      description,
      price: Number(price),
      item,
      type,
      colors: processedColors,
      brand,
      category,
      gender,
      part,
      images: imageUrls,
      sizes: processedSizes,
      stockCount: count,
      stockStatus,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error("CRITICAL ADD PRODUCT ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET ACTIVE PRODUCTS (CLIENT-SIDE)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: "active" });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    const {
      productName,
      productNumber,
      description,
      price,
      item,
      brand,
      category,
      type,
      gender,
      part,
      stockCount,
    } = req.body;

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Process images
    let updatedImages = existingProduct.images;
    if (req.body.existingImages) {
      try {
        let imgs = req.body.existingImages;
        while (typeof imgs === "string") { imgs = JSON.parse(imgs); }
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
        while (typeof parsed === "string") { parsed = JSON.parse(parsed); }
      } catch (err) {}

      if (!Array.isArray(parsed)) { parsed = [parsed]; }
      updatedSizes = parsed.flat(Infinity).map((item) => String(item).trim()).filter(Boolean);
    }
    updatedSizes = updatedSizes.filter((s) => typeof s === "string" && s.length > 0);

    // Dynamic stock management
    let stockStatus = "Out Of Stock";
    const count = Number(stockCount);
    if (count > 5) {
      stockStatus = "In Stock";
    } else if (count >= 1 && count <= 5) {
      stockStatus = "Few Stock Available";
    }

    // Assemble payload
    const updateData = {
      productName,
      productNumber,
      description,
      price: Number(price),
      item,
      brand,
      category,
      type,
      gender,
      part,
      stockCount: count,
      stockStatus,
      sizes: updatedSizes,
      images: updatedImages,
    };

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
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