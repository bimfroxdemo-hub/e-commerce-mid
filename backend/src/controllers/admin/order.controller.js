const Order = require('../../models/Order');
const User = require('../../models/User');
const Product = require('../../models/Product'); 
const OrderService = require('../../services/order.service');
const EmailService = require('../../services/email.service');
const { sendSuccess, sendError } = require('../../utils/response');

const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      search,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};
    
    // ✅ SCOPING RULE: Lock sellers only to orders containing their products
    let sellerProducts = [];
    if (req.user && req.user.role === 'seller') {
      sellerProducts = await Product.find({ seller: req.user._id }).distinct('_id');
      filter['items.product'] = { $in: sellerProducts };
    }

    // Schema field corrected to 'status' (from 'orderStatus')
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    
    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } },
        { 'shippingAddress.email': { $regex: search, $options: 'i' } }
      ];
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    let orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('items.product', 'name images seller')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    // ✅ SANITIZATION: Filter items array so merchants can't spy on other sellers' products inside split orders
    if (req.user && req.user.role === 'seller') {
      orders = orders.map(order => {
        const orderObj = order.toObject();
        orderObj.items = orderObj.items.filter(item => 
          item.product && sellerProducts.some(spId => String(spId) === String(item.product._id || item.product))
        );
        return orderObj;
      });
    }

    sendSuccess(res, 'Orders fetched successfully', {
      orders,
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

const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images sku seller');

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    // ✅ SECURITY BLOCK: Ensure sellers only access orders containing their products
    if (req.user && req.user.role === 'seller') {
      const sellerProducts = await Product.find({ seller: req.user._id }).distinct('_id');
      const hasSellerProduct = order.items.some(item => 
        item.product && sellerProducts.some(spId => String(spId) === String(item.product._id || item.product))
      );

      if (!hasSellerProduct) {
        return sendError(res, 'Access denied: Order does not contain your products', 403);
      }

      const orderObj = order.toObject();
      orderObj.items = orderObj.items.filter(item => 
        item.product && sellerProducts.some(spId => String(spId) === String(item.product._id || item.product))
      );

      return sendSuccess(res, 'Order fetched successfully', orderObj);
    }

    sendSuccess(res, 'Order fetched successfully', order);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, notes } = req.body;
    const orderId = req.params.id;

    // ✅ SECURITY BLOCK: Verify product ownership before granting status editing permissions
    if (req.user && req.user.role === 'seller') {
      const sellerProducts = await Product.find({ seller: req.user._id }).distinct('_id');
      const orderCheck = await Order.findById(orderId);
      
      if (!orderCheck) {
        return sendError(res, 'Order not found', 404);
      }

      const hasSellerProduct = orderCheck.items.some(item => 
        item.product && sellerProducts.some(spId => String(spId) === String(item.product))
      );

      if (!hasSellerProduct) {
        return sendError(res, 'Access denied: You do not own any products in this order', 403);
      }
    }

    const order = await OrderService.updateOrderStatus(orderId, status, trackingNumber);
    
    if (notes) {
      order.notes = notes;
      await order.save();
    }

    sendSuccess(res, 'Order status updated successfully', order);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const orderId = req.params.id;

    // ✅ Platform-level payment parameters are restricted to Admins only
    if (req.user && req.user.role === 'seller') {
      return sendError(res, 'Access denied: Payment status can only be modified by Administrators', 403);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    sendSuccess(res, 'Payment status updated successfully', order);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const orderId = req.params.id;

    // ✅ SECURITY BLOCK: Verify product ownership before allowing sellers to trigger cancellations
    if (req.user && req.user.role === 'seller') {
      const sellerProducts = await Product.find({ seller: req.user._id }).distinct('_id');
      const orderCheck = await Order.findById(orderId);
      
      if (!orderCheck) {
        return sendError(res, 'Order not found', 404);
      }

      const hasSellerProduct = orderCheck.items.some(item => 
        item.product && sellerProducts.some(spId => String(spId) === String(item.product))
      );

      if (!hasSellerProduct) {
        return sendError(res, 'Access denied: You do not own any products in this order', 403);
      }
    }

    const order = await OrderService.cancelOrder(orderId, reason);
    sendSuccess(res, 'Order cancelled successfully', order);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const getOrderStats = async (req, res) => {
  try {
    let filter = {};
    let totalOrders = 0;
    let statusStats = [];
    let paymentStats = [];
    let recentOrders = [];
    let sellerProducts = [];

    // ✅ SCOPED STATS CALCULATION FOR SELLERS (Uses corrected schema paths)
    if (req.user && req.user.role === 'seller') {
      sellerProducts = await Product.find({ seller: req.user._id }).distinct('_id');
      filter['items.product'] = { $in: sellerProducts };

      totalOrders = await Order.countDocuments(filter);

      statusStats = await Order.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      paymentStats = await Order.aggregate([
        { $match: filter },
        { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
      ]);

      // Split revenue calculation summing items.total strictly belonging to this seller
      const monthlyRevenue = await Order.aggregate([
        {
          $match: {
            'items.product': { $in: sellerProducts },
            createdAt: { 
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
            },
            status: { $ne: 'cancelled' }
          }
        },
        { $unwind: '$items' },
        { $match: { 'items.product': { $in: sellerProducts } } },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        }
      ]);

      recentOrders = await Order.find(filter)
        .populate('user', 'name email')
        .populate('items.product', 'name price seller')
        .sort({ createdAt: -1 })
        .limit(5);

      recentOrders = recentOrders.map(order => {
        const orderObj = order.toObject();
        orderObj.items = orderObj.items.filter(item => 
          item.product && sellerProducts.some(spId => String(spId) === String(item.product._id || item.product))
        );
        return orderObj;
      });

      return sendSuccess(res, 'Order stats fetched successfully', {
        totalOrders,
        statusStats,
        paymentStats,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        recentOrders
      });
    }

    // Default global aggregate stats for Admins
    totalOrders = await Order.countDocuments();
    
    statusStats = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    paymentStats = await Order.aggregate([
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
    ]);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { 
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
          },
          status: { $ne: 'cancelled' }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    sendSuccess(res, 'Order stats fetched successfully', {
      totalOrders,
      statusStats,
      paymentStats,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      recentOrders
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const generateInvoice = async (req, res) => {
  try {
    const orderId = req.params.id;
    
    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('items.product', 'name seller');

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    // ✅ SECURITY BLOCK: Verify split order permissions before invoicing
    if (req.user && req.user.role === 'seller') {
      const sellerProducts = await Product.find({ seller: req.user._id }).distinct('_id');
      const hasSellerProduct = order.items.some(item => 
        item.product && sellerProducts.some(spId => String(spId) === String(item.product._id || item.product))
      );

      if (!hasSellerProduct) {
        return sendError(res, 'Access denied', 403);
      }

      const orderObj = order.toObject();
      orderObj.items = orderObj.items.filter(item => 
        item.product && sellerProducts.some(spId => String(spId) === String(item.product._id || item.product))
      );

      return sendSuccess(res, 'Invoice data fetched successfully', orderObj);
    }

    sendSuccess(res, 'Invoice data fetched successfully', order);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const sendOrderUpdate = async (req, res) => {
  try {
    const { message } = req.body; 
    const orderId = req.params.id;

    const order = await Order.findById(orderId).populate('user').populate('items.product', 'seller');
    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    // ✅ SECURITY BLOCK: Verify product ownership before sending mail alerts
    if (req.user && req.user.role === 'seller') {
      const sellerProducts = await Product.find({ seller: req.user._id }).distinct('_id');
      const hasSellerProduct = order.items.some(item => 
        item.product && sellerProducts.some(spId => String(spId) === String(item.product._id || item.product))
      );

      if (!hasSellerProduct) {
        return sendError(res, 'Access denied', 403);
      }
    }

    await EmailService.sendEmail({
      to: order.user.email,
      subject: `Order Update - ${order.orderId}`,
      html: `
        <h1>Order Update</h1>
        <p>Hi ${order.user.name},</p>
        <p>There's an update for your order ${order.orderId}:</p>
        <p>${message}</p>
        <p>Thank you for shopping with us!</p>
      `
    });

    sendSuccess(res, 'Order update sent successfully');
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

module.exports = {
  getAllOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  getOrderStats,
  generateInvoice,
  sendOrderUpdate
};