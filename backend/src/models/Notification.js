// src/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['PRODUCT_CREATED', 'PRICE_CHANGED', 'LOW_STOCK', 'ORDER_RECEIVED'],
    required: true
  },
  message: { type: String, required: true },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    productId: mongoose.Schema.Types.ObjectId,
    orderId: mongoose.Schema.Types.ObjectId,
    oldPrice: Number,
    newPrice: Number
  },
  readByAdmin: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);