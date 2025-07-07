// Các thư viện
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Khởi tạo app
const app = express();
app.use(cors());
app.use(express.json());


const port = process.env.PORT;
const mongoURI = process.env.MONGODB_URI;
// Kết nối MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected successfully!');
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1); // Nên thoát ứng dụng nếu không kết nối được DB
    });
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
