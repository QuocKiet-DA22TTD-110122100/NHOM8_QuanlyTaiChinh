const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Đăng ký tài khoản mới
 *     description: Tạo tài khoản người dùng mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 default: user
 *                 example: "user"
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Đăng ký thành công"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Lỗi validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Đăng nhập
 *     description: Đăng nhập vào hệ thống
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Email hoặc mật khẩu không đúng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes working!',
    timestamp: new Date().toISOString()
  });
});

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Register request:', req.body);
    
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('Password hash created for', email, ':', hashedPassword.substring(0, 20) + '...');

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: role || 'user', // Sử dụng role từ request hoặc default 'user'
      status: 'active'
    });

    await user.save();
    console.log('User created:', user.email);
    
    // Test password immediately after save
    const testUser = await User.findOne({ email });
    const testPassword = await bcrypt.compare(password, testUser.password);
    console.log('Password test after save:', testPassword ? 'PASSED' : 'FAILED');

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login request received:', req.body);
    console.log('🔐 Request headers:', req.headers);
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Login failed: Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền email và mật khẩu'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    console.log('🔍 User lookup result:', user ? 'User found' : 'User not found');
    if (!user) {
      console.log('❌ Login failed: User not found for email:', email);
      return res.status(400).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Check password
    console.log('Login debug - User found:', user.email);
    console.log('Login debug - Stored hash:', user.password);
    console.log('Login debug - Input password:', password);
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Login debug - Password comparison result:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('Login debug - Password validation FAILED');
      return res.status(400).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }
    
    console.log('Login debug - Password validation PASSED');

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('Login successful:', user.email);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token không tồn tại'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User không tồn tại'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(401).json({
      success: false,
      message: 'Token không hợp lệ'
    });
  }
});

module.exports = router;
