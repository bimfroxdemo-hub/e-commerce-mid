const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");

// ======================
// GET ALL CARTS (ADMIN)
// ======================
router.get("/admin/all", async (req, res) => {
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

// ======================
// GET USER CART
// ======================
router.get("/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });

    if (!cart) {
      return res.json({
        success: true,
        items: [],
      });
    }

    res.json({
      success: true,
      items: cart.items,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ======================
// ADD TO CART
// ======================
router.post("/add", async (req, res) => {
  try {
    const item = req.body;

    let cart = await Cart.findOne({ userId: item.userId });

    if (!cart) {
      cart = await Cart.create({
        userId: item.userId,
        items: [],
      });
    }

    cart.items.push({
      productId: item.productId,
      title: item.title,
      price: item.price,
      image: item.image,
      qty: item.qty || 1,
    });

    await cart.save();

    res.json({
      success: true,
      items: cart.items,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
router.get("/", async (req, res) => {
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