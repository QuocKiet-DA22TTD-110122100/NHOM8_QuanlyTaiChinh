const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Import middleware
const { auth } = require('./middlewares/auth'); // Nếu ở thư mục middlewares

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
  max: 10000 // tăng lên 10,000 requests mỗi 15 phút
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

// Debug swagger spec
console.log('Swagger paths:', Object.keys(swaggerSpec.paths || {}));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Import routes
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const reportRoutes = require('./routes/reports');
const bankRoutes = require('./routes/bankApi');
// const userRoutes = require('./routes/users');

// Routes
app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/users', auth, userRoutes);
app.use('/api/v1/transactions', auth, transactionRoutes);
app.use('/api/v1/reports', auth, reportRoutes);
app.use('/api/v1/bank', bankRoutes);

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
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://admin:123456@localhost:27017/financeapp?authSource=admin')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth test: http://localhost:${PORT}/api/v1/auth/test`);
});

module.exports = { app, server };


