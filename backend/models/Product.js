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
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    collect: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    item: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      trim: true,
    },

    part: {
      type: String,
      trim: true,
    },

    colors: [
      {
        type: String,
        trim: true,
      },
    ],

    material: {
      type: String,
      trim: true,
    },

    images: [
      {
        type: String,
      },
    ],

    // Dynamic array of size objects
    sizes: [
      {
        size: { 
          type: String, 
          required: true, 
          trim: true 
        },
        quantity: { 
          type: Number, 
          required: true, 
          min: 0, 
          default: 0 
        }
      }
    ],

    // Total stock (Sum of all size quantities)
    stockCount: {
      type: Number,
      default: 0,
      min: 0,
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

// PRE-SAVE HOOK: Calculates stockCount, stockStatus & status automatically
productSchema.pre("save", async function () {
  // 1. Calculate stockCount from sizes
  if (this.sizes && this.sizes.length > 0) {
    this.stockCount = this.sizes.reduce(
      (total, s) => total + (Number(s.quantity) || 0),
      0
    );
  } else {
    this.stockCount = 0;
  }

  // 2. Set stockStatus based on stockCount
  if (this.stockCount <= 0) {
    this.stockStatus = "Out Of Stock";
    this.status = "inactive"; // Automatically set status to inactive when stock hits 0
  } else if (this.stockCount <= 5) {
    this.stockStatus = "Few Stock Available";
  } else {
    this.stockStatus = "In Stock";
  }
});

module.exports = mongoose.model("Product", productSchema);