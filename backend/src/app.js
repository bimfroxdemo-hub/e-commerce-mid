const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import middlewares
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// ==================== SECURITY MIDDLEWARE ====================
// Configure helmet for development HTTPS
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: false, // Disable HSTS in development
}));

// ==================== RATE LIMITING ====================
// More lenient rate limiting for development
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 1000 : 10000, // Higher limit in dev
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/';
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Higher limit in dev
  message: 'Too many API requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development for certain paths
    if (process.env.NODE_ENV !== 'production') {
      return req.path.includes('/auth') || req.path.includes('/health');
    }
    return false;
  }
});

// Apply rate limiting only in production or when explicitly enabled
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_RATE_LIMIT === 'true') {
  app.use(generalLimiter);
  app.use('/api', apiLimiter);
} else {
  console.log('⚠️ Rate limiting disabled in development');
}

// ==================== CORS CONFIGURATION ====================
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://luxe-store-frontend.vercel.app',
  'https://luxe-store-psi-nine.vercel.app',
  
  // HTTP Origins
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',

  // HTTPS Origins  
  'https://localhost:3000',
  'https://localhost:5173',
  'https://127.0.0.1:3000',
  'https://127.0.0.1:5173',
  
  // Add Vite dev server default
  'http://localhost:5174',
  'https://localhost:5174'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      console.log('✅ CORS: Request with no origin allowed');
      return callback(null, true);
    }

    // Allow all vercel.app preview deployments
    if (origin.endsWith('.vercel.app')) {
      console.log('✅ CORS: Vercel deployment allowed:', origin);
      return callback(null, true);
    }

    // Allow localhost with any port in development
    if (process.env.NODE_ENV !== 'production' && 
        (origin.startsWith('http://localhost:') || 
         origin.startsWith('https://localhost:') ||
         origin.startsWith('http://127.0.0.1:') ||
         origin.startsWith('https://127.0.0.1:'))) {
      console.log('✅ CORS: Development localhost allowed:', origin);
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('✅ CORS: Allowed origin:', origin);
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      console.warn('Allowed origins:', allowedOrigins);
      // In development, allow the request but log the warning
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔧 Development mode: Allowing blocked origin');
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control'
  ],
  optionsSuccessStatus: 200
};

// Apply CORS
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  console.log('🔧 Preflight request for:', req.headers.origin);
  cors(corsOptions)(req, res, () => {
    res.status(200).end();
  });
});

// ==================== ADDITIONAL CORS HEADERS ====================
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Allow dynamic origins in development
  if (process.env.NODE_ENV !== 'production' && origin) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// ==================== BODY PARSING ====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== STATIC FILES ====================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== REQUEST LOGGING ====================
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'} - IP: ${req.ip}`);
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
    environment: process.env.NODE_ENV || 'development',
    cors: {
      origin: req.headers.origin || 'none',
      allowedOrigins: allowedOrigins
    }
  });
});

// ==================== ROOT ROUTE ====================
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Luxe Premium Store API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      admin: '/api/admin/*',
      shop: '/api/shop',
      cart: '/api/cart',
      orders: '/api/orders'
    },
    cors: {
      requestOrigin: req.headers.origin || 'none',
      allowedOrigins: allowedOrigins
    }
  });
});

// ==================== SAFE ROUTER LOADER ====================
const loadRoute = (routePath, routeName) => {
  try {
    const routeModule = require(routePath);
    
    if (typeof routeModule === 'function') {
      return routeModule;
    }
    
    if (routeModule && typeof routeModule.router === 'function') {
      console.warn(`⚠️ ${routeName} uses { router } export pattern`);
      return routeModule.router;
    }
    
    if (routeModule && typeof routeModule.default === 'function') {
      console.warn(`⚠️ ${routeName} uses default export pattern`);
      return routeModule.default;
    }
    
    console.error(`❌ Invalid export in ${routeName}`);
    console.error('Module type:', typeof routeModule);
    console.error('Module keys:', Object.keys(routeModule || {}));
    
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
    console.error('Error:', error.message);
    
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
app.use('/api/admin/reels', loadRoute('./routes/admin/reel.routes', 'admin/reel.routes'));

// User/Customer Routes
app.use('/api/home', loadRoute('./routes/user/home.routes', 'user/home.routes'));
app.use('/api/shop', loadRoute('./routes/user/shop.routes', 'user/shop.routes'));
app.use('/api/cart', loadRoute('./routes/user/cart.routes', 'user/cart.routes'));
app.use('/api/checkout', loadRoute('./routes/user/checkout.routes', 'user/checkout.routes'));
app.use('/api/orders', loadRoute('./routes/user/order.routes', 'user/order.routes'));
app.use('/api/wishlist', loadRoute('./routes/user/wishlist.routes', 'user/wishlist.routes'));
app.use('/api/reviews', loadRoute('./routes/user/review.routes', 'user/review.routes'));
app.use('/api/profile', loadRoute('./routes/user/profile.routes', 'user/profile.routes'));
app.use('/api/reels', loadRoute('./routes/user/reel.routes', 'user/reel.routes'));

// Payment routes (for Razorpay)
app.use('/api/payment', loadRoute('./routes/user/payment.routes', 'user/payment.routes'));
// Add this line with your other route registrations
app.use('/api/checkout', loadRoute('./routes/user/checkout.routes', 'user/checkout.routes'));

// ==================== ERROR HANDLING ====================
app.use(notFound);
app.use(errorHandler);

// ==================== EXPORT ====================
module.exports = app;