const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function debugLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://admin:123456@localhost:27017/financeapp?authSource=admin');
    
    console.log('=== DEBUG LOGIN ===');
    
    // Check if user exists
    const user = await User.findOne({ email: 'admin@gmail.com' });
    console.log('User found:', user ? 'YES' : 'NO');
    
    if (user) {
      console.log('User details:', {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        passwordHash: user.password.substring(0, 20) + '...'
      });
      
      // Test password
      const testPassword = 'admin123';
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log('Password test:', isValid ? 'VALID' : 'INVALID');
      
      // Test with different password
      const testPassword2 = 'admin';
      const isValid2 = await bcrypt.compare(testPassword2, user.password);
      console.log('Password test (admin):', isValid2 ? 'VALID' : 'INVALID');
      
      // Hash the same password to compare
      const newHash = await bcrypt.hash(testPassword, 12);
      console.log('New hash:', newHash.substring(0, 20) + '...');
      console.log('Hashes match:', user.password === newHash ? 'YES' : 'NO');
      
    } else {
      console.log('No user found with email: admin@gmail.com');
    }
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

debugLogin(); 