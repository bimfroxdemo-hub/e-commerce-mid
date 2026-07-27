const Order = require('../../models/Order');
const Cart = require('../../models/Cart');
const Product = require('../../models/Product');
const { sendSuccess, sendError } = require('../../utils/response');
const { generateOrderId } = require('../../utils/generateOrderId');
const PaymentService = require('../../services/payment.service'); // ✅ Imported payment service

const processCheckout = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const {
      customerInfo,
      shippingAddress,
      billingAddress,
      paymentMethod = 'razorpay',
      notes = '',
      couponCode = null,
      items = null
    } = req.body;

    // ✅ COMPREHENSIVE DEBUGGING
    console.log('📦 RAW REQUEST BODY:', JSON.stringify(req.body, null, 2));

    // ✅ VALIDATIONS
    if (!customerInfo) {
      return sendError(res, 'Customer information is required', 400);
    }

    if (!customerInfo.name) {
      return sendError(res, 'Customer name is required', 400);
    }

    const cleanName = String(customerInfo.name || '').trim();
    if (cleanName.length < 2 || cleanName.length > 50) {
      return sendError(res, 'Name must be between 2 and 50 characters', 400);
    }

    if (!customerInfo.email || !isValidEmail(customerInfo.email)) {
      return sendError(res, 'Please provide a valid email', 400);
    }

    if (!customerInfo.phone || customerInfo.phone.toString().length < 10) {
      return sendError(res, 'Please provide a valid phone number', 400);
    }

    const validPaymentMethods = ['razorpay', 'cod', 'upi', 'card', 'paypal'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return sendError(res, 'Invalid payment method', 400);
    }

    if (!shippingAddress) {
      return sendError(res, 'Shipping address is required', 400);
    }

    const requiredAddressFields = ['address', 'city', 'state', 'pincode'];
    const missingFields = requiredAddressFields.filter(field => !shippingAddress[field]);
    if (missingFields.length > 0) {
      return sendError(res, `Missing required address fields: ${missingFields.join(', ')}`, 400);
    }

    // Get cart items
    let orderItems;
    if (items && Array.isArray(items)) {
      orderItems = items;
    } else {
      const cart = await Cart.findOne({ user: userId }).populate('items.product');
      if (!cart || !cart.items.length) {
        return sendError(res, 'Cart is empty', 400);
      }
      orderItems = cart.items;
    }

    // Validate and calculate order
    let subtotal = 0;
    const processedItems = [];

    for (let item of orderItems) {
      const product = item.product._id ? item.product : await Product.findById(item.product);
      
      if (!product) {
        return sendError(res, `Product not found: ${item.product}`, 400);
      }

      if (!product.isActive) {
        return sendError(res, `Product "${product.name}" is no longer available`, 400);
      }

      const availableStock = product.inventory?.quantity ?? product.stock ?? 0;
      if (item.quantity > availableStock) {
        return sendError(res, `Insufficient stock for "${product.name}". Available: ${availableStock}`, 400);
      }

      const itemPrice = product.salePrice || product.price;
      const itemTotal = itemPrice * item.quantity;
      
      processedItems.push({
        product: product._id,
        productDetails: {
          name: product.name,
          price: itemPrice,
          image: product.images?.[0]?.url || product.image || '',
          sku: product.sku
        },
        quantity: item.quantity,
        price: itemPrice,
        total: itemTotal
      });

      subtotal += itemTotal;
    }

    // Calculate totals
    const shipping = calculateShipping(subtotal, shippingAddress);
    const tax = calculateTax(subtotal, shippingAddress.state);
    
    let discount = 0;
    let appliedCoupon = null;
    
    if (couponCode) {
      const couponResult = applyCoupon(couponCode, subtotal);
      if (couponResult.success) {
        discount = couponResult.discount;
        appliedCoupon = couponResult.coupon;
      }
    }

    const totalAmount = subtotal + shipping + tax - discount;
    const orderId = generateOrderId();

    // Create order structure
    const order = new Order({
      orderId,
      user: userId,
      items: processedItems,
      customerInfo: {
        name: cleanName,
        email: customerInfo.email.toLowerCase().trim(),
        phone: customerInfo.phone.toString().trim()
      },
      shippingAddress: {
        name: shippingAddress.name || cleanName,
        address: shippingAddress.address.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim(),
        country: shippingAddress.country || 'India'
      },
      billingAddress: billingAddress || shippingAddress,
      subtotal,
      shipping,
      tax,
      discount,
      totalAmount,
      paymentMethod,
      paymentStatus: 'pending',
      notes: notes?.toString().trim() || '',
      appliedCoupon,
      status: 'pending',
      orderDate: new Date()
    });

    await order.save();

    // Clear cart if direct order (not checkout items bypass)
    if (!items) {
      await Cart.findOneAndUpdate(
        { user: userId },
        { items: [], totalAmount: 0 }
      );
    }

    // Reserve inventory
    for (let item of processedItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { 'inventory.quantity': -item.quantity } }
      );
    }

    // 🔥 RAZORPAY ORDER GENERATION FOR ONLINE PAYMENTS
    let rzpOrder = null;
    if (paymentMethod !== 'cod') {
      try {
        // Razorpay server par order create karein
        rzpOrder = await PaymentService.createOrder(totalAmount, order._id.toString());
        order.paymentOrderId = rzpOrder.id;
        await order.save();
      } catch (paymentError) {
        // Rollback database order if Razorpay connection fails
        await Order.findByIdAndDelete(order._id);
        return sendError(res, `Razorpay initialization failed: ${paymentError.message}`, 400);
      }
    }

    console.log('✅ Order & Razorpay session created successfully:', orderId);

    // Return response to frontend
    sendSuccess(res, 'Order created successfully', {
      requiresPayment: paymentMethod !== 'cod',
      razorpayOrder: rzpOrder ? {
        id: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency
      } : null,
      order: {
        orderId: order.orderId,
        _id: order._id,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

  } catch (error) {
    console.error('❌ Checkout error:', error);
    sendError(res, error.message || 'Checkout failed', 500);
  }
};

// Validate coupon endpoint
const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id || req.user._id;

    if (!code) {
      return sendError(res, 'Coupon code is required', 400);
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart || !cart.items.length) {
      return sendError(res, 'Cart is empty', 400);
    }

    const subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const result = applyCoupon(code, subtotal);

    if (result.success) {
      sendSuccess(res, 'Coupon is valid', result);
    } else {
      sendError(res, result.message, 400);
    }

  } catch (error) {
    console.error('❌ Coupon validation error:', error);
    sendError(res, 'Failed to validate coupon', 500);
  }
};

// ==============================
// HELPER FUNCTIONS (Cleaned up)
// ==============================
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const calculateShipping = (subtotal, address) => {
  if (subtotal >= 999) return 0;
  const metro = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'];
  if (metro.includes(address.city)) {
    return 50;
  }
  return 100;
};

const calculateTax = (subtotal, state) => {
  return Math.round(subtotal * 0.18);
};

const applyCoupon = (code, subtotal) => {
  const coupons = {
    'LUXE15': { type: 'percent', value: 15, minOrder: 2000 },
    'FLAT500': { type: 'fixed', value: 500, minOrder: 3000 },
    'WELCOME10': { type: 'percent', value: 10, minOrder: 1000 }
  };

  const coupon = coupons[code.toUpperCase()];
  if (!coupon) {
    return { success: false, message: 'Invalid coupon code' };
  }

  if (subtotal < coupon.minOrder) {
    return { success: false, message: `Minimum order of ₹${coupon.minOrder} required` };
  }

  const discount = coupon.type === 'percent' 
    ? Math.round(subtotal * coupon.value / 100)
    : coupon.value;

  return {
    success: true,
    discount,
    coupon: { code, ...coupon }
  };
};

module.exports = {
  processCheckout,
  validateCoupon
};