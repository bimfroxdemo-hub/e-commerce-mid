const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Order Items
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    // ✅ LINK EACH ITEM TO A SPECIFIC SELLER (References User model)
    // Allows multi-seller split payouts and separate seller dashboard order queries
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    productDetails: {
      name: String,
      price: Number,
      image: String,
      sku: String
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  }],
  
  // Customer Information
  customerInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },
  
  // Addresses
  shippingAddress: {
    name: String,
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  
  billingAddress: {
    name: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  
  // Order Totals
  subtotal: {
    type: Number,
    required: true
  },
  shipping: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  
  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'cod', 'upi', 'card'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: String,
  paymentOrderId: String,
  
  // Order Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  
  // Metadata
  notes: String,
  appliedCoupon: {
    code: String,
    type: String,
    value: Number,
    discount: Number
  },
  
  // Tracking
  trackingId: String,
  estimatedDelivery: Date,
  
  // Timestamps
  orderDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate order total
orderSchema.methods.calculateTotal = function() {
  this.subtotal = this.items.reduce((total, item) => total + item.total, 0);
  this.totalAmount = this.subtotal + this.shipping + this.tax - this.discount;
};

// ✅ HIGH-PERFORMANCE INDEX FOR SELLER-SPECIFIC ORDERS QUERIES
orderSchema.index({ "items.seller": 1 });

module.exports = mongoose.model('Order', orderSchema);