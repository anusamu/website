const crypto = require('crypto');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const sendMail = require('../utils/sendMail');
const { generateShippingEmail } = require('../utils/emailTemplates');

/**
 * Verify Razorpay signature, then create the order in the DB
 * POST /api/orders/create
 */
exports.createOrder = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      items, 
      shippingAddress,
      saveAddress,
      orderType 
    } = req.body;

    // 1. Ensure User is Authenticated
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User must be logged in to create an order."
      });
    }

    // 2. Validate Payment Parameters & Items
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay payment parameters."
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items array is required to create an order."
      });
    }

    // 3. Verify Razorpay Signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error("❌ CRITICAL: RAZORPAY_KEY_SECRET is missing in backend .env");
      return res.status(500).json({
        success: false,
        message: "Server configuration error."
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid signature."
      });
    }

    // 4. Save Address to User Profile if requested
    if (saveAddress && shippingAddress) {
      await User.findByIdAndUpdate(userId, { address: shippingAddress }).catch((err) => {
        console.warn("Could not save address to user document:", err.message);
      });
    }

    // 5. Format Items and capture snapshot of productName & price
    const formattedItems = items.map((item) => {
      const productId = item.product?._id || item.product || item._id;
      const productName = item.productName || item.product?.productName || item.name || item.title || "Product";
      const itemPrice = Number(item.price || item.product?.price || item.product?.wholesalePrice || 0);

      return {
        product: productId,
        productName: productName,
        size: item.size || "OS",
        quantity: Number(item.quantity) || 1,
        price: itemPrice
      };
    });

    // 6. REDUCE stockCount BY ORDERED QUANTITY & UPDATE stockStatus
    for (const item of formattedItems) {
      const { product: productId, quantity } = item;

      // Decrement stockCount safely
      const updatedProduct = await Product.findOneAndUpdate(
        { 
          _id: productId, 
          stockCount: { $gte: quantity } // Prevents stock from going below 0
        },
        { 
          $inc: { stockCount: -quantity } 
        },
        { new: true }
      );

      // Fallback: If stock is already lower than quantity, decrement anyway
      const targetProduct = updatedProduct || await Product.findByIdAndUpdate(
        productId,
        { $inc: { stockCount: -quantity } },
        { new: true }
      );

      // Automatically recalculate stockStatus
      if (targetProduct) {
        let newStatus = "In Stock";
        if (targetProduct.stockCount <= 0) {
          newStatus = "Out Of Stock";
        } else if (targetProduct.stockCount <= 5) {
          newStatus = "Few Stock Available";
        }

        if (targetProduct.stockStatus !== newStatus) {
          await Product.findByIdAndUpdate(productId, { stockStatus: newStatus });
        }
      }
    }

    // 7. Calculate total amount accurately
    const subtotal = formattedItems.reduce((acc, item) => {
      return acc + (item.price * item.quantity);
    }, 0);

    const shippingFee = subtotal > 699 || subtotal === 0 ? 0 : 150;
    const totalAmount = subtotal + shippingFee;

    // 8. Save Order to DB strictly matching OrderSchema
    const newOrder = new Order({
      userId: userId,
      orderType: orderType || "retail",
      items: formattedItems,
      shippingAddress: {
        email: shippingAddress?.email,
        phone: shippingAddress?.phone,
        firstName: shippingAddress?.firstName,
        lastName: shippingAddress?.lastName,
        address: shippingAddress?.address,
        appartment: shippingAddress?.apartment || shippingAddress?.appartment || "",
        city: shippingAddress?.city,
        state: shippingAddress?.state,
        pincode: shippingAddress?.pincode
      },
      totalAmount: totalAmount,
      paymentId: razorpay_payment_id,
      status: "Paid"
    });

    const savedOrder = await newOrder.save();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully and stockCount updated!",
      order: savedOrder
    });

  } catch (error) {
    console.error("❌ BACKEND ORDER CREATION ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error during order creation."
    });
  }
};
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingCode, trackingUrl, courierName, sendEmail, recipientEmail: customRecipientEmail } = req.body;

    // Validate status input against allowed schema values if provided
    const allowedStatuses = ['Paid', 'Packing', 'Shipped', 'Delivered', 'Cancelled'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status value. Allowed values are: ${allowedStatuses.join(', ')}` 
      });
    }

    // Build the dynamic update object
    const updateFields = {};
    if (status) updateFields.status = status;
    if (trackingCode !== undefined) updateFields.trackingCode = typeof trackingCode === 'string' ? trackingCode.trim() : '';
    if (trackingUrl !== undefined) updateFields.trackingUrl = typeof trackingUrl === 'string' ? trackingUrl.trim() : '';
    if (courierName !== undefined) updateFields.courierName = typeof courierName === 'string' ? courierName.trim() : '';
    if (customRecipientEmail && typeof customRecipientEmail === 'string' && customRecipientEmail.trim()) {
      updateFields['shippingAddress.email'] = customRecipientEmail.trim();
    }

    // Find and update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: updateFields },
      { new: true, runValidators: true }
    )
      .populate('userId', 'role firstName lastName email phoneNumber')
      .populate({
        path: 'items.product',
        select: 'productName name title images image price wholesalePrice'
      });

    if (!updatedOrder) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found." 
      });
    }

    let emailSent = false;
    let emailError = null;
    const targetRecipient = (customRecipientEmail && customRecipientEmail.trim()) || 
      updatedOrder.shippingAddress?.email || 
      updatedOrder.userId?.email;

    // Trigger email notification if admin enabled it
    const shouldSendEmail = Boolean(sendEmail === true || sendEmail === 'true');
    if (shouldSendEmail) {
      if (targetRecipient) {
        try {
          const shortId = updatedOrder._id.toString().slice(-8).toUpperCase();
          const emailSubject = `🚚 Your Order #${shortId} Has Been Shipped - RAJAGOPAL HANDLOOMS`;
          const emailHtml = generateShippingEmail({
            order: updatedOrder,
            trackingCode: updatedOrder.trackingCode,
            trackingUrl: updatedOrder.trackingUrl,
            courierName: updatedOrder.courierName
          });

          await sendMail(targetRecipient, emailSubject, emailHtml);
          emailSent = true;
          console.log(`✅ Shipping notification email successfully sent to ${targetRecipient} for Order #${updatedOrder._id}`);
        } catch (mailErr) {
          console.error(`❌ Failed to send shipping notification email to customer:`, mailErr.message || mailErr);
          emailError = mailErr.message || "Failed to deliver email to customer.";
        }
      } else {
        emailError = "No valid customer email address found for this order.";
        console.warn(`⚠️ Cannot send shipping email: Order #${updatedOrder._id} has no customer email.`);
      }
    }

    let feedbackMessage = "Order updated successfully.";
    if (status === 'Shipped') {
      if (shouldSendEmail && emailSent) {
        feedbackMessage = `Order marked as Shipped & tracking email sent to ${targetRecipient}.`;
      } else if (shouldSendEmail && !emailSent) {
        feedbackMessage = `Order marked as Shipped. Tracking email failed: ${emailError || 'Unknown error'}`;
      } else {
        feedbackMessage = "Order marked as Shipped (Email notification skipped).";
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: feedbackMessage, 
      order: updatedOrder,
      emailSent,
      emailError,
      recipientEmail: targetRecipient
    });

  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error updating order status.", 
      error: error.message 
    });
  }
};


/**
 * Get Retail Orders
 * GET /api/admin/orders/retail
 */
exports.getRetailOrders = async (req, res) => {
  try {
    // 1. Fetch retail orders directly using query filtering
    const orders = await Order.find({
      $or: [
        { orderType: "retail" },
        { orderType: { $exists: false } }
      ]
    })
      .populate("userId", "role firstName lastName email phoneNumber")
      .populate({
        path: "items.product",
        select: "productName name title images image price wholesalePrice"
      })
      .sort({ createdAt: -1 });

    // 2. Fallback secondary filter in case user document roles dictate retail classification
    const retailOrders = orders.filter((order) => {
      const userRole = order.userId?.role;
      return !userRole || userRole === "user" || userRole === "retail";
    });

    return res.status(200).json({
      success: true,
      orders: retailOrders
    });
  } catch (error) {
    console.error("Error fetching retail orders:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch retail orders."
    });
  }
};

/**
 * Get Wholesale Orders
 * GET /api/admin/orders/wholesale
 */
exports.getWholesaleOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'role firstName lastName email phoneNumber')
      .populate({ 
        path: 'items.product', 
        select: 'productName name title images image price wholesalePrice' 
      })
      .sort({ createdAt: -1 });

    // Filter for wholesale users
    const wholesaleOrders = orders.filter(
      (order) => order.userId?.role === 'wholesale'
    );

    return res.status(200).json({ success: true, orders: wholesaleOrders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};