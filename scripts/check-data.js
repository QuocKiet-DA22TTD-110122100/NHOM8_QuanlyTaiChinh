const mongoose = require('mongoose');

async function checkData() {
  try {
    await mongoose.connect('mongodb://admin:123456@localhost:27017/financeapp?authSource=admin');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Available collections:', collections.map(c => c.name));
    
    // Check users
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      name: String
    }));
    const userCount = await User.countDocuments();
    console.log('👥 Users count:', userCount);
    
    // Check transactions  
    const Transaction = mongoose.model('Transaction', new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      amount: Number,
      type: String
    }));
    const transactionCount = await Transaction.countDocuments();
    console.log('💰 Transactions count:', transactionCount);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    process.exit(1);
  }
}

checkData();