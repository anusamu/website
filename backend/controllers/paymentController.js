const Razorpay = require('razorpay');

// Initialize Razorpay Instance lazily/safely
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

/**
 * Creates a Razorpay Order ID for the frontend checkout modal
 * POST /api/payments/create-razorpay-order
 */
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    // 1. Convert & validate numeric amount
    const numericAmount = Number(amount);

    if (!amount || isNaN(numericAmount) || numericAmount < 1) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid amount (minimum ₹1) is required." 
      });
    }

    // 2. Razorpay expects amount in paise (1 INR = 100 paise) as an integer
    const amountInPaise = Math.round(numericAmount * 100);

    // 3. Short receipt string (Max 40 chars allowed by Razorpay)
    const receipt = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: receipt.slice(0, 40), // Safeguard length
    };

    // 4. Create Order on Razorpay
    const order = await razorpayInstance.orders.create(options);

    if (!order || !order.id) {
      return res.status(500).json({ 
        success: false, 
        message: "Failed to generate Razorpay order." 
      });
    }

    // 5. Send back successful response
    res.status(200).json({ 
      success: true, 
      order 
    });

  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.description || error.message || "Internal server error during order creation.",
      error: error
    });
  }
};