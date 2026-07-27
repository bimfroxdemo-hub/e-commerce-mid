const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  salePrice: {
    type: Number,
    default: null,
    min: [0, 'Sale price cannot be negative']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  
  // ✅ LINK PRODUCT TO A SPECIFIC SELLER (References User model)
  // Made optional (required: false) to prevent existing admin/system products from throwing errors
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },

  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  inventory: {
    quantity: { 
      type: Number, 
      required: [true, 'Inventory quantity is required'], 
      min: [0, 'Quantity cannot be negative'] 
    },
    lowStockThreshold: { type: Number, default: 10 }
  },
  specifications: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    color: String,
    size: String,
    material: String
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Existing text index for product search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// ✅ NEW INDEX FOR HIGH-PERFORMANCE SELLER SCOPING QUERIES
productSchema.index({ seller: 1 });

module.exports = mongoose.model('Product', productSchema);