const Product = require('../../models/Product');
const InventoryService = require('../../services/inventory.service');
const { sendSuccess, sendError } = require('../../utils/response');

const getInventoryOverview = async (req, res) => {
  try {
    // Check if the request is from a Seller
    if (req.user && req.user.role === 'seller') {
      const sellerId = req.user._id;

      const totalProducts = await Product.countDocuments({ isActive: true, seller: sellerId });
      
      // Fetch low stock items for this seller specifically
      const lowStockProducts = await Product.find({
        isActive: true,
        seller: sellerId,
        $expr: { $lte: ["$inventory.quantity", "$inventory.lowStockThreshold"] }
      }).populate('category', 'name');

      const outOfStockProducts = await Product.countDocuments({
        'inventory.quantity': 0,
        isActive: true,
        seller: sellerId
      });

      const totalStockValue = await Product.aggregate([
        { $match: { isActive: true, seller: sellerId } },
        {
          $group: {
            _id: null,
            totalValue: {
              $sum: { $multiply: ['$price', '$inventory.quantity'] }
            }
          }
        }
      ]);

      return sendSuccess(res, 'Inventory overview fetched successfully', {
        totalProducts,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts,
        totalStockValue: totalStockValue[0]?.totalValue || 0,
        lowStockProducts: lowStockProducts.slice(0, 10)
      });
    }

    // Default global logic for Admins
    const totalProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await InventoryService.getLowStockProducts();
    const outOfStockProducts = await Product.countDocuments({
      'inventory.quantity': 0,
      isActive: true
    });

    const totalStockValue = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: { $multiply: ['$price', '$inventory.quantity'] }
          }
        }
      }
    ]);

    sendSuccess(res, 'Inventory overview fetched successfully', {
      totalProducts,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts,
      totalStockValue: totalStockValue[0]?.totalValue || 0,
      lowStockProducts: lowStockProducts.slice(0, 10)
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const getInventoryList = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      stockStatus,
      category,
      sortBy = 'inventory.quantity',
      sortOrder = 'asc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = { isActive: true };

    // ✅ SCOPING RULE: Filter query by seller ID if role is seller
    if (req.user && req.user.role === 'seller') {
      filter.seller = req.user._id;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (stockStatus === 'low') {
      filter['inventory.quantity'] = { $lte: 10 };
    } else if (stockStatus === 'out') {
      filter['inventory.quantity'] = 0;
    } else if (stockStatus === 'in-stock') {
      filter['inventory.quantity'] = { $gt: 10 };
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(filter)
      .populate('category', 'name')
      .select('name sku price inventory category images')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    sendSuccess(res, 'Inventory list fetched successfully', {
      products,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const updateStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, operation = 'set', reason } = req.body;

    if (quantity < 0) {
      return sendError(res, 'Quantity cannot be negative', 400);
    }

    // ✅ SECURITY BLOCK: Verify product ownership for sellers
    if (req.user && req.user.role === 'seller') {
      const productToCheck = await Product.findById(productId);
      if (!productToCheck) {
        return sendError(res, 'Product not found', 404);
      }
      if (String(productToCheck.seller) !== String(req.user._id)) {
        return sendError(res, 'Access denied: You do not own this product', 403);
      }
    }

    const product = await InventoryService.updateStock(productId, quantity, operation);

    sendSuccess(res, 'Stock updated successfully', {
      productId,
      newQuantity: product.inventory.quantity,
      operation
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const bulkUpdateStock = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { productId, quantity, operation }
    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        // ✅ SECURITY BLOCK: Verify product ownership in bulk update for sellers
        if (req.user && req.user.role === 'seller') {
          const productToCheck = await Product.findById(update.productId);
          if (!productToCheck) {
            errors.push({ productId: update.productId, error: 'Product not found' });
            continue;
          }
          if (String(productToCheck.seller) !== String(req.user._id)) {
            errors.push({ productId: update.productId, error: 'Access denied' });
            continue;
          }
        }

        const product = await InventoryService.updateStock(
          update.productId,
          update.quantity,
          update.operation || 'set'
        );
        
        results.push({
          productId: update.productId,
          success: true,
          newQuantity: product.inventory.quantity
        });
      } catch (error) {
        errors.push({
          productId: update.productId,
          error: error.message
        });
      }
    }

    sendSuccess(res, 'Bulk stock update completed', {
      successful: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const getLowStockAlerts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;

    // ✅ SCOPING RULE: Sellers only receive alerts for their own inventory
    if (req.user && req.user.role === 'seller') {
      const lowStockProducts = await Product.find({
        isActive: true,
        seller: req.user._id,
        'inventory.quantity': { $lte: parseInt(threshold) }
      }).populate('category', 'name');

      return sendSuccess(res, 'Low stock alerts fetched successfully', {
        count: lowStockProducts.length,
        products: lowStockProducts
      });
    }

    const lowStockProducts = await InventoryService.getLowStockProducts(threshold);

    sendSuccess(res, 'Low stock alerts fetched successfully', {
      count: lowStockProducts.length,
      products: lowStockProducts
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const getStockMovementHistory = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // ✅ SECURITY BLOCK: Verify product ownership for sellers
    if (req.user && req.user.role === 'seller') {
      const productToCheck = await Product.findById(productId);
      if (!productToCheck) {
        return sendError(res, 'Product not found', 404);
      }
      if (String(productToCheck.seller) !== String(req.user._id)) {
        return sendError(res, 'Access denied: You do not own this product', 403);
      }
    }

    // Mock stock log data
    const mockHistory = [
      {
        date: new Date(),
        operation: 'add',
        quantity: 50,
        previousQuantity: 100,
        newQuantity: 150,
        reason: 'New stock received',
        updatedBy: 'Admin'
      },
      {
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        operation: 'subtract',
        quantity: 5,
        previousQuantity: 105,
        newQuantity: 100,
        reason: 'Order fulfillment',
        updatedBy: 'System'
      }
    ];

    sendSuccess(res, 'Stock movement history fetched successfully', {
      history: mockHistory,
      pagination: {
        current: parseInt(page),
        pages: 1,
        total: mockHistory.length
      }
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

module.exports = {
  getInventoryOverview,
  getInventoryList,
  updateStock,
  bulkUpdateStock,
  getLowStockAlerts,
  getStockMovementHistory
};