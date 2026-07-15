const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit'); // Missing import
const path = require('path');

// Import middlewares
const { notFound, errorHandler } = require("./middleware/errorHandler");


const app = express(); // Declare app first

// ==================== SECURITY MIDDLEWARE ====================
app.use(helmet());

// ==================== RATE LIMITING ====================
// General rate limiter for all routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Allow many requests for general routes
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit API requests more strictly
  message: 'Too many API requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Apply stricter rate limiting to API routes
app.use('/api', apiLimiter);

// ==================== CORS CONFIGURATION ====================
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://luxe-store-frontend.vercel.app',
  'https://luxe-store-psi-nine.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Allow all vercel.app preview deployments
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// ==================== BODY PARSING ====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== STATIC FILES ====================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== REQUEST LOGGING (Development Only) ====================
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - IP: ${req.ip}`);
    next();
  });
}

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Luxe Backend Services online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Alias for /home/health (frontend compatibility)
app.get('/home/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Luxe Backend Services online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ==================== ROOT ROUTE ====================
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Luxe Premium Store API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      admin: '/api/admin/*',
      shop: '/api/shop',
      cart: '/api/cart',
      orders: '/api/orders'
    }
  });
});

// ==================== SAFE ROUTER LOADER ====================
const loadRoute = (routePath, routeName) => {
  try {
    const routeModule = require(routePath);
    
    // Direct router export
    if (typeof routeModule === 'function') {
      return routeModule;
    }
    
    // Object with router property
    if (routeModule && typeof routeModule.router === 'function') {
      console.warn(`⚠️ ${routeName} uses { router } export pattern`);
      return routeModule.router;
    }
    
    // ES6 default export
    if (routeModule && typeof routeModule.default === 'function') {
      console.warn(`⚠️ ${routeName} uses default export pattern`);
      return routeModule.default;
    }
    
    // Invalid export
    console.error(`❌ Invalid export in ${routeName}`);
    console.error('Module type:', typeof routeModule);
    console.error('Module keys:', Object.keys(routeModule || {}));
    
    // Return empty router instead of crashing
    console.error(`🔴 Creating empty router for ${routeName}`);
    const fallbackRouter = express.Router();
    fallbackRouter.all('*', (req, res) => {
      res.status(503).json({
        success: false,
        message: `Service temporarily unavailable: ${routeName}`
      });
    });
    return fallbackRouter;
    
  } catch (error) {
    console.error(`❌ Failed to load route: ${routeName}`);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    console.error('Stack trace:', error.stack);
    // Return fallback router
    const fallbackRouter = express.Router();
    fallbackRouter.all('*', (req, res) => {
      res.status(503).json({
        success: false,
        message: `Route not available: ${routeName}`,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    });
    return fallbackRouter;
  }
};

// ==================== API ROUTES ====================

// Authentication
app.use('/api/auth', loadRoute('./routes/auth.routes', 'auth.routes'));

// Admin Routes
app.use('/api/admin/dashboard', loadRoute('./routes/admin/dashboard.routes', 'admin/dashboard.routes'));
app.use('/api/admin/products', loadRoute('./routes/admin/product.routes', 'admin/product.routes'));
app.use('/api/admin/inventory', loadRoute('./routes/admin/inventory.routes', 'admin/inventory.routes'));
app.use('/api/admin/orders', loadRoute('./routes/admin/order.routes', 'admin/order.routes'));
app.use('/api/admin/users', loadRoute('./routes/admin/user.routes', 'admin/user.routes'));
app.use('/api/admin/categories', loadRoute('./routes/admin/category.routes', 'admin/category.routes'));
app.use('/api/admin/banners', loadRoute('./routes/admin/banner.routes', 'admin/banner.routes'));
app.use('/api/admin/coupons', loadRoute('./routes/admin/coupon.routes', 'admin/coupon.routes'));
app.use('/api/admin/settings', loadRoute('./routes/admin/settings.routes', 'admin/settings.routes'));
// Reel routes
app.use('/api/admin/reels', loadRoute('./routes/admin/reel.routes', 'admin/reel.routes'));
app.use('/api/reels', loadRoute('./routes/user/reel.routes', 'user/reel.routes'));



// User/Customer Routes
app.use('/api/home', loadRoute('./routes/user/home.routes', 'user/home.routes'));
app.use('/api/shop', loadRoute('./routes/user/shop.routes', 'user/shop.routes'));
app.use('/api/cart', loadRoute('./routes/user/cart.routes', 'user/cart.routes'));
app.use('/api/checkout', loadRoute('./routes/user/checkout.routes', 'user/checkout.routes'));
app.use('/api/orders', loadRoute('./routes/user/order.routes', 'user/order.routes'));
app.use('/api/wishlist', loadRoute('./routes/user/wishlist.routes', 'user/wishlist.routes'));
app.use('/api/reviews', loadRoute('./routes/user/review.routes', 'user/review.routes'));
app.use('/api/profile', loadRoute('./routes/user/profile.routes', 'user/profile.routes'));

// ==================== ERROR HANDLING ====================
// 404 Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

// ==================== EXPORT ====================
module.exports = app;