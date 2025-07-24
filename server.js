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
const swaggerJsdoc = require('swagger-jsdoc');

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

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: ['sort', 'fields', 'page', 'limit', 'category', 'type']
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// CORS Configuration
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080',
      'https://your-frontend-domain.com'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Static files
app.use('/uploads', express.static('uploads'));
app.use('/public', express.static('public'));

// Cập nhật swaggerSpec để scan files
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '💰 Hệ thống Quản lý Tài chính Cá nhân',
      version: '2.0.0',
      description: `
      ## 🚀 Tính năng chính
      - 📊 Quản lý thu nhập và chi tiêu
      - 💳 Theo dõi giao dịch real-time
      - 📈 Báo cáo thống kê chi tiết
      - 🎯 Thiết lập ngân sách thông minh
      - 🏦 Tích hợp API ngân hàng
      - 🔔 Thông báo và cảnh báo
      - 📱 Hỗ trợ mobile responsive
      `,
      contact: {
        name: 'NHÓM 8 - Quản lý Tài chính',
        email: 'support@finance.com',
        url: 'https://github.com/QuocKiet-DA22TTD-110122100/NHOM8_QuanlyTaiChinh'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: '🖥️ Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            amount: { type: 'number' },
            type: { type: 'string', enum: ['income', 'expense'] },
            category: { type: 'string' },
            description: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
            userId: { type: 'string' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      }
    },
    tags: [
      { name: 'Health', description: 'System health endpoints' },
      { name: 'Authentication', description: 'User authentication' },
      { name: 'Users', description: 'User management' },
      { name: 'Transactions', description: 'Transaction management' },
      { name: 'Reports', description: 'Financial reports' },
      { name: 'Bank Integration', description: 'Bank API integration' }
    ]
  },
  apis: ['./routes/*.js', './server.js'] // Scan JSDoc comments từ các files
};

// Tạo specs từ JSDoc comments
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI with custom CSS
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Finance API Documentation"
}));

// API Documentation redirect
app.get('/docs', (req, res) => {
  res.redirect('/api-docs');
});

// Root route with API info
app.get('/', (req, res) => {
  res.json({
    message: '💰 Finance Management API',
    version: '2.0.0',
    status: 'running',
    documentation: `${req.protocol}://${req.get('host')}/api-docs`,
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      transactions: '/api/v1/transactions',
      reports: '/api/v1/reports',
      users: '/api/v1/users',
      bank: '/api/v1/bank'
    },
    features: [
      'JWT Authentication',
      'Real-time WebSocket',
      'Rate Limiting',
      'Data Validation',
      'Error Handling',
      'API Documentation'
    ]
  });
});

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    redis: redisService.isConnected ? 'connected' : 'disconnected',
    memory: process.memoryUsage(),
    cpu: process.cpuUsage()
  });
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      database: mongoose.connection.readyState === 1,
      redis: redisService.isConnected,
      websocket: websocketService.wss ? 'active' : 'inactive'
    }
  });
});

// Routes with proper middleware
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/transactions', auth, transactionRoutes);
app.use('/api/v1/reports', auth, reportRoutes);
app.use('/api/v1/users', auth, userRoutes);
app.use('/api/v1/bank', auth, bankRoutes);

// Fallback auth routes (if routes/auth.js doesn't exist)
app.get('/api/v1/auth/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Auth routes working!',
    timestamp: new Date().toISOString()
  });
});

// API status endpoint
app.get('/api/v1/status', (req, res) => {
  res.json({
    success: true,
    data: {
      server: 'Finance Management API',
      version: '2.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      features: {
        authentication: true,
        transactions: true,
        reports: true,
        websocket: true,
        bankIntegration: true
      }
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
    availableEndpoints: [
      'GET /api/v1/health',
      'GET /api/v1/auth/test',
      'POST /api/v1/auth/login',
      'POST /api/v1/auth/register',
      'GET /api/v1/transactions',
      'POST /api/v1/transactions',
      'GET /api/v1/reports',
      'GET /api/v1/users/profile'
    ]
  });
});

// Global 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    suggestion: 'Visit /api-docs for API documentation'
  });
});

// Global error handler
app.use(globalErrorHandler);

// Database connection with retry logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://admin:123456@localhost:27017/financeapp?authSource=admin',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    );
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

// Connect to database
connectDB();

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('🛑 Received shutdown signal. Closing server gracefully...');
  
  server.close(() => {
    console.log('✅ HTTP server closed.');
    
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed.');
      
      if (redisService.client) {
        redisService.client.quit(() => {
          console.log('✅ Redis connection closed.');
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    });
  });
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  gracefulShutdown();
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`🔐 Auth test: http://localhost:${PORT}/api/v1/auth/test`);
  console.log(`💰 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server };
