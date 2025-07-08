const express            = require('express');
const mongoose           = require('mongoose');
const cors               = require('cors');
const helmet             = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const swaggerJSDoc        = require('swagger-jsdoc');
const swaggerUi          = require('swagger-ui-express');
const redis              = require('redis');
const authMiddleware     = require('./middleware/auth');
const connectDB          = require('./config/db');       // Nếu bạn có module kết nối DB riêng
const swaggerSpec        = require('./config/swagger'); // Nếu bạn đã tách swagger ra file config
const logger = require('./config/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Kết nối MongoDB
connectDB();

// 2. Kết nối Redis
const redisClient = redis.createClient({ url: process.env.REDIS_URL });
redisClient.on('error', err => logger.error('Redis Error:', err));
redisClient.connect();

// 3. Cấu hình chung
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://your-frontend-domain.com'
    : 'http://localhost:3000',
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(express.json());
app.use(express.static('public'));

// 4. Rate limiter (100 req / 1 giờ / IP)
const rateLimiter = new RateLimiterMemory({ points: 100, duration: 3600 });
app.use((req, res, next) => {
  rateLimiter.consume(req.ip)
    .then(() => next())
    .catch(() => res.status(429).json({ message: 'Too Many Requests' }));
});

// 5. Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 6. Các route công khai
app.use('/api/auth', require('./routes/auth'));

// 7. Middleware xác thực cho các route cần token
app.use(authMiddleware);

// 8. Route đã xác thực & cache mẫu với Redis
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/reports', async (req, res, next) => {
  const cacheKey = `reports:${req.user.id}:${req.query.date}`;
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));
  } catch (e) {
    console.error('Cache error:', e);
  }
  next();
}, require('./routes/reports'));

// 9. Route tĩnh (Web UI)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// 10. Error handler (luôn đặt cuối)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Đã xảy ra lỗi hệ thống',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});