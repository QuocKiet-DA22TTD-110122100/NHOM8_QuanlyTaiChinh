require('dotenv').config();
const express = require('express');
const { RateLimiterMemory } = require('rate-limiter-flexible');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware phân tích JSON
app.use(express.json());

// Cấu hình rate limiter: tối đa 5 requests mỗi 10 giây cho mỗi IP
const rateLimiter = new RateLimiterMemory({
  points: 5,          // số request tối đa
  duration: 10,       // trong vòng 10 giây
});

// 🔐 Middleware giới hạn tốc độ truy cập
app.use((req, res, next) => {
  rateLimiter.consume(req.ip)
    .then(() => {
      next(); // cho phép đi tiếp nếu chưa vượt quá giới hạn
    })
    .catch(() => {
      res.status(429).json({ message: 'Too Many Requests - Quá nhiều yêu cầu!' });
    });
});

// 🛠️ Một route ví dụ
app.get('/', (req, res) => {
  res.json({ message: 'Xin chào từ API!' });
});

// ❌ Route cố tình gây lỗi để test error handler
app.get('/error', (req, res, next) => {
  next(new Error('Có lỗi xảy ra ở /error'));
});

// 🧯 Middleware xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  console.error('Lỗi:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Đã xảy ra lỗi hệ thống',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
