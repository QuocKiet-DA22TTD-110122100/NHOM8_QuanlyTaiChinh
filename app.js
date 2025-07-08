// Các thư viện
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet'); // Thêm helmet
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const redis = require('redis');
// Bỏ dotenv vì Docker Compose truyền biến môi trường
console.log('[INFO] MONGO_URI:', process.env.MONGO_URI);
console.log('[INFO] PORT:', process.env.PORT);
// Kết nối Redis
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect();
// Ví dụ: Cache dữ liệu báo cáo
app.use('/api/reports', async (req, res, next) => {
  const cacheKey = `reports:${req.user.id}:${req.query.date}`;
  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }
    next();
  } catch (err) {
    console.error('Redis cache error:', err);
    next();
  }
});
// Khởi tạo app
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
const { RateLimiterMemory } = require('rate-limiter-flexible');

const rateLimiter = new RateLimiterMemory({
  points: 100, // Số lượng request tối đa
  duration: 3600, // Trong 1 giờ
});

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10, // Giới hạn số kết nối đồng thời
  serverSelectionTimeoutMS: 5000, // Thời gian chờ chọn server
  retryWrites: true, // Thử lại khi ghi thất bại
  w: 'majority', // Đảm bảo ghi dữ liệu an toàn
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware xác thực
const authMiddleware = require('./middleware/auth');

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance App API',
      version: '1.0.0',
      description: 'API quản lý tài chính cá nhân',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js', './app.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Định tuyến
/**
 * @swagger
 * /:
 *   get:
 *     summary: Trang chủ ứng dụng
 *     description: Hiển thị giao diện web quản lý tài chính
 *     responses:
 *       200:
 *         description: Trả về trang HTML
 */
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', authMiddleware, require('./routes/transactions'));
app.use('/api/reports', authMiddleware, require('./routes/reports'));

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Đã xảy ra lỗi hệ thống',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
// Middleware giới hạn tốc độ truy cập
app.use((req, res, next) => {
  rateLimiter.consume(req.ip)
    .then(() => next())
    .catch(() => res.status(429).json({ message: 'Too Many Requests' }));
});

// Cấu hình CORS với các tùy chọn cụ thể
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://your-frontend-domain.com' : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static('public'));

// Khởi động server
app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
