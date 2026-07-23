// Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Differentiates Retail vs Wholesale
    orderType: {
      type: String,
      enum: ['retail', 'wholesale'],
      default: 'retail',
      required: true,
      index: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        
        size: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        // Stores price per item snapshot at time of purchase
        price: {
          type: Number,
          required: true,
        },
      },
    ],

    shippingAddress: {
      email: String,
      phone: String,
      firstName: String,
      lastName: String,
      address: String,
      appartment: String,
      city: String,
      state: String,
      pincode: String,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentId: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ['Paid', 'Packing', 'Shipped', 'Delivered'],
      default: 'Paid',
    },

    trackingCode: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);