const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Không có token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    
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

const isAdmin = async (req, res, next) => {
  try {
    // req.user đã được gán ở middleware auth
    const user = await User.findOne({ email: req.user.email });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền admin' });
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi kiểm tra quyền admin' });
  }
};

module.exports = auth;
module.exports.isAdmin = isAdmin;

