const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { CustomError } = require('../middleware/errorHandler');
const router = express.Router();

// Mock user data (replace with actual User model)
const users = [
  {
    id: new mongoose.Types.ObjectId(), // ← Dùng ObjectId thay vì số
    email: 'test@example.com',
    password: '$2b$10$hash...', // bcrypt hash
    name: 'Test User'
  }
];

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes working!',
    timestamp: new Date().toISOString()
  });
});

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return next(new CustomError('All fields are required', 400));
    }

    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return next(new CustomError('User already exists', 400));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = {
      id: Date.now(),
      email,
      password: hashedPassword,
      name,
      createdAt: new Date()
    };
    users.push(user);

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new CustomError('Email and password are required', 400));
    }

    // Find user (mock data for now)
    const user = users.find(u => u.email === email);
    if (!user) {
      return next(new CustomError('Invalid credentials', 401));
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return next(new CustomError('Invalid credentials', 401));
    }

    // Generate token with same secret as middleware
    const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
    const token = jwt.sign(
      { 
        userId: user.id.toString(), // Convert ObjectId to string
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' } // Tăng thời gian để test
    );

    console.log('🎫 Token generated for user:', user.email);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
