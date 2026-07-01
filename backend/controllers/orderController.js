const Order = require("../models/Order");

// =========================
// CREATE ORDER
// =========================
const createOrder = async (req, res) => {
  try {
    const { items, amount, shippingInfo } = req.body;

    const order = await Order.create({
      items,
      amount,
      shippingInfo,
      paymentStatus: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
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
// GET ALL ORDERS (ADMIN)
// =========================
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =========================
// GET SINGLE ORDER
// =========================
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

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
// UPDATE PAYMENT STATUS
// =========================
const updateOrderPaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Payment status updated",
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
// DELETE ORDER
// =========================
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Order deleted",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderPaymentStatus,
  deleteOrder,
};