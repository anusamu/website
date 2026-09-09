const Product = require("../models/Product");
const OfferBanner = require("../models/OfferBanner");

// Apply offer to products based on filters
exports.applyOffer = async (req, res) => {
  try {
    const { filters, offerPercentage, productId } = req.body;

    if (!offerPercentage || offerPercentage <= 0 || offerPercentage > 100) {
      return res.status(400).json({ success: false, message: "Invalid offer percentage" });
    }

    if (productId) {
      // Apply offer to a single product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      product.offerPercentage = offerPercentage;
      await product.save();
      return res.status(200).json({
        success: true,
        message: "Offer updated successfully for the product.",
        updatedCount: 1,
      });
    }

    // Build query based on filters
    const query = {};
    if (filters) {
      if (filters.collect) query.collect = filters.collect;
      if (filters.category) query.category = filters.category;
      if (filters.item) query.item = filters.item;
      if (filters.type) query.type = filters.type;
      if (filters.gender) query.gender = filters.gender;
      if (filters.material) query.material = filters.material;
      // Note: sizes is an array of objects, this might be tricky to filter. Assuming exact match is not common, we skip size or implement elemMatch.
      if (filters.sizes) {
        query.sizes = { $elemMatch: { size: filters.sizes } };
      }
    }

    const products = await Product.find(query);

    let updatedCount = 0;
    for (const product of products) {
      // Keep the higher offer
      if (!product.offerPercentage || offerPercentage > product.offerPercentage) {
        product.offerPercentage = offerPercentage;
        // The pre-save hook will handle calculating discountedPrice
        await product.save();
        updatedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Offer applied successfully to ${updatedCount} products.`,
      updatedCount,
    });
  } catch (error) {
    console.error("Error applying offer:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Remove offer from products based on filters
exports.removeOffer = async (req, res) => {
  try {
    const { filters, productId } = req.body;

    if (productId) {
      // Remove offer from a single product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      product.offerPercentage = 0;
      await product.save();
      return res.status(200).json({
        success: true,
        message: "Offer removed successfully from the product.",
        updatedCount: 1,
      });
    }

    // Build query based on filters
    const query = {};
    if (filters) {
      if (filters.collect) query.collect = filters.collect;
      if (filters.category) query.category = filters.category;
      if (filters.item) query.item = filters.item;
      if (filters.type) query.type = filters.type;
      if (filters.gender) query.gender = filters.gender;
      if (filters.material) query.material = filters.material;
      if (filters.sizes) {
        query.sizes = { $elemMatch: { size: filters.sizes } };
      }
    }

    const products = await Product.find(query);

    let updatedCount = 0;
    for (const product of products) {
      if (product.offerPercentage > 0) {
        product.offerPercentage = 0;
        await product.save();
        updatedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Offer removed successfully from ${updatedCount} products.`,
      updatedCount,
    });
  } catch (error) {
    console.error("Error removing offer:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get the active offer banner
exports.getBanner = async (req, res) => {
  try {
    const banner = await OfferBanner.findOne({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, banner });
  } catch (error) {
    console.error("Error getting offer banner:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update or set the offer banner
exports.updateBanner = async (req, res) => {
  try {
    let { imageUrl, isActive } = req.body;

    // Explicitly parse boolean from formData string
    if (typeof isActive === 'string') {
      isActive = isActive === 'true';
    }

    if (req.file && req.file.path) {
      imageUrl = req.file.path;
    }

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: "Banner image URL or file is required" });
    }

    // Inactivate all existing banners
    await OfferBanner.updateMany({}, { isActive: false });

    // Create or set the new banner active
    const newBanner = new OfferBanner({
      imageUrl,
      isActive: isActive !== undefined ? isActive : true,
    });

    await newBanner.save();

    res.status(200).json({
      success: true,
      message: "Offer banner updated successfully",
      banner: newBanner,
    });
  } catch (error) {
    console.error("Error updating offer banner:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get all products currently on offer
exports.getActiveOfferProducts = async (req, res) => {
  try {
    const products = await Product.find({ offerPercentage: { $gt: 0 } })
      .select("productName productNumber price discountedPrice offerPercentage category type gender images")
      .sort({ updatedAt: -1 });
      
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    console.error("Error getting active offer products:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
