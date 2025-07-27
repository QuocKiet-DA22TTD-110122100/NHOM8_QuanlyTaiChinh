const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function finalTest() {
  try {
    console.log('=== FINAL LOGIN TEST ===');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://admin:123456@localhost:27017/financeapp?authSource=admin');
    console.log('Connected to MongoDB');
    
    // Check current user
    const user = await User.findOne({ email: 'admin@gmail.com' });
    console.log('User exists:', !!user);
    
    if (user) {
      console.log('User details:', {
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        passwordLength: user.password.length
      });
      
      // Test password directly
      const password = '123456';
      const isValid = await bcrypt.compare(password, user.password);
      console.log('Direct password test:', isValid ? 'PASSED' : 'FAILED');
      
      // Test with login logic
      const loginUser = await User.findOne({ email: 'admin@gmail.com' });
      if (loginUser) {
        const loginPasswordValid = await bcrypt.compare(password, loginUser.password);
        console.log('Login logic test:', loginPasswordValid ? 'PASSED' : 'FAILED');
        
        if (loginPasswordValid) {
          console.log('✅ LOGIN SHOULD WORK!');
        } else {
          console.log('❌ LOGIN WILL FAIL!');
        }
      }
    }
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

finalTest(); 