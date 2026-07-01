const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});


// =========================
// CREATE PAYMENT ORDER
// =========================
const createPaymentOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // INR → paise
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =========================
// VERIFY PAYMENT + SAVE ORDER
// =========================
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      amount,
      shippingInfo,
    } = req.body;

    // signature verify
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {

      // PAYMENT SUCCESS → ORDER SAVE
      const order = await Order.create({
        items,
        amount,
        shippingInfo,
        paymentStatus: "paid",
      });

      return res.json({
        success: true,
        message: "Payment verified & order saved",
        order,
      });

    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
};