require('dotenv').config();
const express = require('express');

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Finance App Simple Server',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/v1/health',
      'GET /api/transactions',
      'POST /api/transactions',
      'GET /api/auth/test',
      'POST /api/auth/login',
      'POST /api/auth/register'
    ]
  });
});

// Health check endpoints (multiple versions for compatibility)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

// Mock transactions endpoints
app.get('/api/transactions', (req, res) => {
  res.json({ 
    success: true,
    data: {
      transactions: [
        {
          id: '1',
          amount: 50000,
          type: 'expense',
          category: 'food',
          description: 'Lunch',
          date: new Date().toISOString()
        },
        {
          id: '2', 
          amount: 100000,
          type: 'income',
          category: 'salary',
          description: 'Monthly salary',
          date: new Date().toISOString()
        }
      ],
      total: 2,
      page: 1,
      limit: 10
    }
  });
});

app.post('/api/transactions', (req, res) => {
  const { amount, type, category, description } = req.body;
  
  if (!amount || !type || !category) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: amount, type, category'
    });
  }

  res.status(201).json({
    success: true,
    data: {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      type,
      category,
      description: description || '',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    },
    message: 'Transaction created successfully'
  });
});

// Mock auth endpoints
app.get('/api/auth/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth endpoint is working',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Mock successful login
  res.json({
    success: true,
    data: {
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: '1',
        email: email,
        name: 'Test User'
      }
    },
    message: 'Login successful'
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: 'Email, password and name are required'
    });
  }

  // Mock successful registration
  res.status(201).json({
    success: true,
    data: {
      user: {
        id: Date.now().toString(),
        email: email,
        name: name,
        createdAt: new Date().toISOString()
      }
    },
    message: 'User registered successfully'
  });
});

// Mock reports endpoint
app.get('/api/reports/monthly', (req, res) => {
  res.json({
    success: true,
    data: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      totalIncome: 500000,
      totalExpense: 300000,
      balance: 200000,
      transactionCount: 15,
      categories: {
        food: { total: 150000, count: 8 },
        transport: { total: 80000, count: 4 },
        entertainment: { total: 70000, count: 3 }
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/v1/health', 
      'GET /api/transactions',
      'POST /api/transactions',
      'GET /api/auth/test',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/reports/monthly'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth test: http://localhost:${PORT}/api/auth/test`);
  console.log(`💰 Transactions: http://localhost:${PORT}/api/transactions`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully.');
  server.close(() => {
    console.log('Process terminated.');
  });
});

// Database connection (non-blocking)
setTimeout(async () => {
  try {
    const connectDB = require('./config/database');
    await connectDB();
    console.log('✅ Database connected');
  } catch (error) {
    console.log('⚠️ Database connection failed, but server still running');
  }
}, 1000);

module.exports = app;
