const express = require("express");
const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderPaymentStatus,
  deleteOrder,
} = require("../controllers/orderController");

// ROUTES
router.post("/", createOrder);
router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.put("/:id", updateOrderPaymentStatus);
router.delete("/:id", deleteOrder);

module.exports = router;