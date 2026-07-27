const User = require('../../models/User');
const Product = require('../../models/Product');
const Order = require('../../models/Order');
const Category = require('../../models/Category');
const { sendSuccess, sendError } = require('../../utils/response');

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const isSeller = req.user && req.user.role === 'seller';
    const sellerId = req.user ? req.user._id : null;

    // ==========================================
    // 1. TOTAL COUNT SCOPING RULES
    // ==========================================
    const totalUsers = isSeller 
      ? 0 // Sellers do not have access to global user counts
      : await User.countDocuments({ role: 'user' });

    const totalProducts = isSeller
      ? await Product.countDocuments({ seller: sellerId })
      : await Product.countDocuments();

    const totalOrders = isSeller
      ? await Order.countDocuments({ 'items.seller': sellerId })
      : await Order.countDocuments();

    const totalCategories = isSeller
      ? await Category.countDocuments() // Let sellers see all system categories
      : await Category.countDocuments();

    // ==========================================
    // 2. MONTHLY COUNTS SCOPING RULES
    // ==========================================
    const monthlyUsers = isSeller
      ? 0
      : await User.countDocuments({
          role: 'user',
          createdAt: { $gte: startOfMonth }
        });

    const monthlyOrders = isSeller
      ? await Order.countDocuments({
          'items.seller': sellerId,
          createdAt: { $gte: startOfMonth }
        })
      : await Order.countDocuments({
          createdAt: { $gte: startOfMonth }
        });

    // ==========================================
    // 3. REVENUE STAGE AGGREGATIONS (Scoped dynamically)
    // ==========================================
    let currentRevenue = 0;
    let previousRevenue = 0;

    if (isSeller) {
      // Precise split revenue aggregation: Sum items.total only for this seller's products
      const monthlyRevenueAgg = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth },
            status: { $ne: 'cancelled' },
            'items.seller': sellerId
          }
        },
        { $unwind: '$items' },
        {
          $match: {
            'items.seller': sellerId
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$items.total' }
          }
        }
      ]);

      const lastMonthRevenueAgg = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
            status: { $ne: 'cancelled' },
            'items.seller': sellerId
          }
        },
        { $unwind: '$items' },
        {
          $match: {
            'items.seller': sellerId
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$items.total' }
          }
        }
      ]);

      currentRevenue = monthlyRevenueAgg[0]?.total || 0;
      previousRevenue = lastMonthRevenueAgg[0]?.total || 0;
    } else {
      // Global revenue aggregates using corrected "totalAmount" schema field
      const monthlyRevenueAgg = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth },
            status: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]);

      const lastMonthRevenueAgg = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
            status: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]);

      currentRevenue = monthlyRevenueAgg[0]?.total || 0;
      previousRevenue = lastMonthRevenueAgg[0]?.total || 0;
    }

    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(2)
      : 0;

    // ==========================================
    // 4. RECENT ORDERS SCOPING
    // ==========================================
    const orderQuery = isSeller ? { 'items.seller': sellerId } : {};
    const recentOrders = await Order.find(orderQuery)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // ==========================================
    // 5. LOW STOCK PRODUCTS SCOPING
    // ==========================================
    const stockQuery = { 'inventory.quantity': { $lte: 10 } };
    if (isSeller) {
      stockQuery.seller = sellerId;
    }
    const lowStockProducts = await Product.find(stockQuery).limit(5);

    // ==========================================
    // 6. ORDER STATUS DISTRIBUTION
    // ==========================================
    const matchStage = isSeller ? { $match: { 'items.seller': sellerId } } : { $match: {} };
    const orderStatusStats = await Order.aggregate([
      matchStage,
      {
        $group: {
          _id: '$status', // Uses corrected schema field 'status'
          count: { $sum: 1 }
        }
      }
    ]);

    // ==========================================
    // 7. SALES CHART DATA (Last 7 Days)
    // ==========================================
    let salesChartData = [];

    if (isSeller) {
      salesChartData = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            status: { $ne: 'cancelled' },
            'items.seller': sellerId
          }
        },
        { $unwind: '$items' },
        {
          $match: {
            'items.seller': sellerId
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            sales: { $sum: '$items.total' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]);
    } else {
      salesChartData = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            status: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            sales: { $sum: '$totalAmount' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]);
    }

    sendSuccess(res, 'Dashboard stats fetched successfully', {
      summary: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalCategories,
        monthlyUsers,
        monthlyOrders,
        monthlyRevenue: currentRevenue,
        revenueGrowth: parseFloat(revenueGrowth)
      },
      recentOrders,
      lowStockProducts,
      orderStatusStats,
      salesChartData
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const isSeller = req.user && req.user.role === 'seller';
    const sellerId = req.user ? req.user._id : null;

    let recentUsers = [];

    if (isSeller) {
      // Find customers who recently placed an order containing this seller's products
      const recentCustomerOrders = await Order.find({ 'items.seller': sellerId })
        .sort({ createdAt: -1 })
        .limit(10);

      // Keep them distinct by email
      const uniqueCustomers = [];
      const seenEmails = new Set();

      for (const order of recentCustomerOrders) {
        if (!seenEmails.has(order.customerInfo.email)) {
          seenEmails.add(order.customerInfo.email);
          uniqueCustomers.push({
            name: order.customerInfo.name,
            email: order.customerInfo.email,
            createdAt: order.createdAt
          });
        }
      }
      recentUsers = uniqueCustomers;
    } else {
      recentUsers = await User.find({ role: 'user' })
        .select('name email createdAt')
        .sort({ createdAt: -1 })
        .limit(10);
    }

    const productQuery = isSeller ? { seller: sellerId } : {};
    const recentProducts = await Product.find(productQuery)
      .select('name price createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    sendSuccess(res, 'Recent activity fetched successfully', {
      recentUsers,
      recentProducts
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivity
};