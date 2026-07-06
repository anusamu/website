const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },

    productNumber: {
      type: String,
      required: true, // Recommended to keep product numbers unique
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    // Brand
    brand: {
      type: String,
      trim: true,
    },

    // Category (Populated dynamically from Category collection)
    category: {
      type: String,
      required: true, // Made required since it's a core dynamic dropdown field
      trim: true,
    },

    // Item (Men, Women, Kids, etc. Populated dynamically from Item collection)
    item: {
      type: String,
      required: true,
      trim: true,
    },

    // Product Type (Saree, T-shirt, etc. Populated dynamically from Type collection)
    type: {
      type: String,
      required: true,
      trim: true,
    },

    // Male / Female / Unisex
    gender: {
      type: String,
      trim: true,
    },

    // Body Part
    part: {
      type: String,
      trim: true,
    },

    // Available Colours
    colors: [
      {
        type: String,
        trim: true,
      },
    ],

    images: [
      {
        type: String, // Cloudinary URL
      },
    ],

    // Flexible sizes array to accommodate both clothing strings and numerical measurements
    sizes: [
      {
        type: String,
        trim: true,
      },
    ],

    stockCount: {
      type: Number,
      default: 0,
    },

    stockStatus: {
      type: String,
      enum: [
        "Out Of Stock",
        "Few Stock Available",
        "In Stock",
      ],
      default: "Out Of Stock",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);