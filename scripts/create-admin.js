const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createAdmin() {
  try {
    // Connect to MongoDB with authentication
    await mongoose.connect('mongodb://admin:123456@localhost:27017/financeapp?authSource=admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Delete existing admin user
    await User.deleteOne({ email: 'admin@gmail.com' });
    console.log('Deleted existing admin user');
    
    // Create new admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = new User({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active'
    });
    
    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@gmail.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    
    // Test login
    const user = await User.findOne({ email: 'admin@gmail.com' });
    const isPasswordValid = await bcrypt.compare('admin123', user.password);
    console.log('Password validation test:', isPasswordValid ? 'PASSED' : 'FAILED');
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

createAdmin(); 