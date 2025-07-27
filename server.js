require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const http = require('http');
const swaggerJsdoc = require('swagger-jsdoc'); // ✅ CHỈ KHAI BÁO 1 LẦN

const app = express();
const server = http.createServer(app);

// Import models
const User = require('./models/User');
const Transaction = require('./models/Transaction');

// Import routes
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');
const bankRoutes = require('./routes/bankApi');

// Import middleware
const auth = require('./middleware/auth');
const { globalErrorHandler } = require('./middleware/errorHandler');

// Import services
const redisService = require('./config/redis');
const websocketService = require('./services/websocket');

// Initialize Redis
redisService.connect();

// Initialize WebSocket
websocketService.initialize(server);

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '💰 Hệ thống Quản lý Tài chính Cá nhân',
      version: '2.0.0',
      description: 'API for personal finance management'
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server'
      }
    ]
  },
  apis: ['./routes/*.js', './server.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: '💰 Finance Management API',
    version: '2.0.0',
    status: 'running',
    documentation: `${req.protocol}://${req.get('host')}/api-docs`
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Health check (for Docker)
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/transactions', auth, transactionRoutes);
app.use('/api/v1/reports', auth, reportRoutes);
app.use('/api/v1/users', auth, userRoutes);
app.use('/api/v1/bank', auth, bankRoutes);

// Global error handler
app.use(globalErrorHandler);

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://admin:123456@localhost:27017/financeapp?authSource=admin'
    );
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    setTimeout(connectDB, 5000);
  }
};

connectDB();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
});

module.exports = { app, server };
