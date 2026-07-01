const express = require("express");
const User = require("../models/User");
const Cart = require("../models/Cart");
const auth = require("../middleware/auth");

const router = express.Router();

// ======================
// SAFE ADMIN CHECK
// ======================
const adminOnly = (req, res, next) => {
  try {
    if (!req.user || req.user.role?.toLowerCase() !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin only",
      });
    }

    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

// ======================
// GET USERS (ADMIN)
// ======================
router.get("/users", auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find();

    res.json({
      success: true,
      users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ======================
// GET CARTS (ADMIN)
// ======================
router.get("/carts", auth, adminOnly, async (req, res) => {
  try {
    const carts = await Cart.find();

    res.json({
      success: true,
      carts,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;