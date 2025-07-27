const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function fixAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://admin:123456@localhost:27017/financeapp?authSource=admin');
    
    console.log('=== FIXING ADMIN USER ===');
    
    // Delete existing admin user
    await User.deleteOne({ email: 'admin@gmail.com' });
    console.log('Deleted existing admin user');
    
    // Create new admin user with simple password
    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 10);
    
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
    console.log('Password: 123456');
    console.log('Role: admin');
    
    // Test the password immediately
    const savedUser = await User.findOne({ email: 'admin@gmail.com' });
    const isPasswordValid = await bcrypt.compare(password, savedUser.password);
    console.log('Password validation test:', isPasswordValid ? 'PASSED' : 'FAILED');
    
    // Test login API
    console.log('\n=== TESTING LOGIN API ===');
    const http = require('http');
    const data = JSON.stringify({email: 'admin@gmail.com', password: '123456'});
    
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        console.log('Login API Status:', res.statusCode);
        console.log('Login API Response:', responseData);
      });
    });
    
    req.on('error', e => console.error('Login API Error:', e.message));
    req.write(data);
    req.end();
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

fixAdmin(); 