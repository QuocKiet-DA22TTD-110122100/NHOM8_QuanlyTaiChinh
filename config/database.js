const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/finance-app');

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create default categories
    await createDefaultCategories();
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const createDefaultCategories = async () => {
  const Category = require('../models/Category');
  
  const defaultCategories = [
    { name: 'Ăn uống', type: 'expense', icon: '🍽️', color: '#FF6B6B', isDefault: true },
    { name: 'Di chuyển', type: 'expense', icon: '🚗', color: '#4ECDC4', isDefault: true },
    { name: 'Mua sắm', type: 'expense', icon: '🛍️', color: '#45B7D1', isDefault: true },
    { name: 'Giải trí', type: 'expense', icon: '🎬', color: '#96CEB4', isDefault: true },
    { name: 'Y tế', type: 'expense', icon: '🏥', color: '#FFEAA7', isDefault: true },
    { name: 'Lương', type: 'income', icon: '💰', color: '#6C5CE7', isDefault: true },
    { name: 'Đầu tư', type: 'income', icon: '📈', color: '#A29BFE', isDefault: true },
    { name: 'Khác (Chi)', type: 'expense', icon: '📝', color: '#FD79A8', isDefault: true },
    { name: 'Khác (Thu)', type: 'income', icon: '📝', color: '#FD79A8', isDefault: true }
  ];

  for (const categoryData of defaultCategories) {
    const existingCategory = await Category.findOne({ name: categoryData.name, isDefault: true });
    if (!existingCategory) {
      await Category.create(categoryData);
    }
  }
};

module.exports = connectDB;


