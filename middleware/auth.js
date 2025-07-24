const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Không có token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    
    // Fixed ObjectId for testing
    const testUserId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
    
    const mockUser = {
      _id: testUserId,
      email: decoded.email || 'test@example.com',
      name: 'Test User'
    };

    req.user = mockUser;
    next();

  } catch (error) {
    console.error('❌ Auth error:', error.message);
    res.status(401).json({ success: false, message: 'Token không hợp lệ' });
  }
};

module.exports = auth;

