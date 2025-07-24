const mongoose = require('mongoose');
require('dotenv').config();

const checkMongoDB = async () => {
  try {
    console.log('🔍 Checking MongoDB connection...');
    console.log('📍 MONGO_URI:', process.env.MONGO_URI);
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://admin:123456@localhost:27017/financeapp?authSource=admin', {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB connection successful!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🏠 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
    
    await mongoose.connection.close();
    console.log('🔒 Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

checkMongoDB();