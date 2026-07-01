const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  items: Array,
  amount: Number,
  paymentStatus: {
    type: String,
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Order", orderSchema);