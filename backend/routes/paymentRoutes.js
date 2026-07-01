const express = require("express");
const router = express.Router();

const {
  createPaymentOrder,
  verifyPayment,
} = require("../controllers/paymentController");

// CREATE RAZORPAY ORDER
router.post("/create-order", createPaymentOrder);

// VERIFY PAYMENT + SAVE ORDER
router.post("/verify", verifyPayment);

module.exports = router;