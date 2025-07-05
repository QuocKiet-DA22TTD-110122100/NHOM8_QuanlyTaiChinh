// Các thư viện
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Khởi tạo app
const app = express();
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Middleware xác thực
const authMiddleware = require('./middleware/auth');

// Định tuyến
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

// Khởi động server
app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
