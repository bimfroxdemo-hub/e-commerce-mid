require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const User = require('./models/User');

const PORT = process.env.PORT || 5001;

// ==================== DATABASE CONNECTION ====================
connectDB();

// ==================== CREATE DEFAULT ADMIN ====================
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      role: 'admin'
    });

    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin'
      });
      console.log('✅ Default admin user created');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }
};

// ==================== START SERVER (Local Only) ====================
if (process.env.NODE_ENV !== 'production') {
  // Removed redundant const PORT declaration here to use the outer PORT definition
  app.listen(PORT, () => {
    console.log('=================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: development`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log('=================================');
    
    if (typeof createDefaultAdmin === 'function') {
      createDefaultAdmin().catch(err => {
        console.error('⚠️ Admin creation failed:', err.message);
      });
    }
  });
  
  // ==================== ERROR HANDLERS (Local Only) ====================
  process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err.message);
    console.error(err.stack);
  });

  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    console.error(err.stack);
    process.exit(1);
  });
}

// ==================== VERCEL EXPORT ====================
module.exports = app;