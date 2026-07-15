const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  // Agar already connected hai toh reuse karo (Vercel serverless ke liye important)
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('✅ Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('❌ MongoDB URI not found in environment variables');
    }

    console.log('🔄 Connecting to MongoDB...');
    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    cachedConnection = conn;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
    
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // ⚠️ process.exit(1) mat karo — Vercel pe function crash ho jata hai
    throw error;
  }
};

module.exports = connectDB;