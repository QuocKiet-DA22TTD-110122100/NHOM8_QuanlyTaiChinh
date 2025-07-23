const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');

// Import services
const redisService = require('./config/redis');
const websocketService = require('./services/websocket');

const app = express();
const server = http.createServer(app);

// Initialize Redis
redisService.connect();

// Initialize WebSocket
websocketService.initialize(server);

// Security Middleware
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/transactions', require('./routes/transactions'));
app.use('/api/v1/categories', require('./routes/categories'));
app.use('/api/v1/reports', require('./routes/reports'));
app.use('/api/v1/notifications', require('./routes/notifications'));
app.use('/api/v1/upload', require('./routes/upload'));
app.use('/api/v1/bank-accounts', require('./routes/bankAccounts'));
app.use('/api/v1/goals', require('./routes/goals'));
app.use('/api/v1/webhooks', require('./routes/webhooks')); // New webhook routes

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    redis: redisService.isConnected,
    websocket: websocketService.wss ? 'active' : 'inactive'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Finance App API Server',
    version: '1.0.0',
    status: 'running'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!' 
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

module.exports = { app, server };


