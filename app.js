const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
// Thêm middleware xác thực JWT
const authMiddleware = require('./middleware/auth');

// Bảo vệ các route quan trọng
app.use('/api/transactions', authMiddleware, require('./routes/transactions'));

// Thêm route mới cho báo cáo thống kê
app.use('/api/reports', authMiddleware, require('./routes/reports'));

// Thêm xử lý lỗi tập trung
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Đã xảy ra lỗi hệ thống',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
