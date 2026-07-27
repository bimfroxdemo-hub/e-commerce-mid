const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Order = require('../../models/Order');
const razorpayInstance = require('../../config/razorpay');
const authModule = require('../../middleware/auth');

// Resolve authentication middleware
const authenticate = typeof authModule === 'function' ? authModule : authModule.authenticate;

// ==============================
// 1. CREATE RAZORPAY ORDER
// ==============================
router.post('/create-order', authenticate, async (req, res) => {
  try {
    const { orderId } = req.body;

    // Retrieve order details from database
    const order = await Order.findOne({ orderId: orderId });
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found in database' 
      });
    }

    const options = {
      amount: Math.round(order.totalAmount * 100), // Amount must be passed in paise (e.g. ₹100 = 10000 paise)
      currency: "INR",
      receipt: orderId,
    };

    // Initialize Razorpay Order via config instance
    razorpayInstance.orders.create(options, async (err, razorpayOrder) => {
      if (err) {
        console.error("❌ Razorpay order creation failed:", err);
        return res.status(500).json({ 
          success: false, 
          message: err.message || 'Failed to create payment order' 
        });
      }

      // Save Razorpay payment order reference back to MongoDB
      order.paymentOrderId = razorpayOrder.id;
      await order.save();

      return res.status(200).json({ 
        success: true, 
        message: 'Payment order created successfully',
        data: razorpayOrder 
      });
    });

  } catch (error) {
    console.error("❌ Payment create order error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error during payment initialization' 
    });
  }
});

// ==============================
// 2. VERIFY RAZORPAY PAYMENT SIGNATURE
// ==============================
router.post('/verify', authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required Razorpay parameters for verification' 
      });
    }

    // Verify hash signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "your-razorpay-secret")
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Find order matching the Razorpay order ID reference
      const order = await Order.findOne({ paymentOrderId: razorpay_order_id });
      if (!order) {
        return res.status(404).json({ 
          success: false, 
          message: 'Associated order not found' 
        });
      }

      // Update payment state parameters to MongoDB
      order.paymentStatus = 'paid';
      order.status = 'confirmed'; // Elevate standard order status to confirmed
      order.paymentId = razorpay_payment_id;
      await order.save();

      return res.status(200).json({ 
        success: true, 
        message: "Payment verified successfully", 
        order 
      });
    } else {
      console.warn("⚠️ Invalid Razorpay payment signature detected");
      return res.status(400).json({ 
        success: false, 
        message: "Invalid signature verification. Payment failed." 
      });
    }
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error during payment verification' 
    });
  }
});

module.exports = router;