const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async (retries = 5, delay = 5000) => {
  // Kiểm tra MONGO_URI trước khi thử kết nối
  if (!process.env.MONGO_URI) {
    logger.error('MONGO_URI not defined in environment variables');
    process.exit(1);
  }

  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        maxPoolSize: 10, // Tối đa 10 kết nối trong pool
        serverSelectionTimeoutMS: 5000, // Timeout sau 5s nếu không tìm thấy server
        retryWrites: true, // Thử lại các thao tác ghi bị lỗi
        w: 'majority', // Đảm bảo ghi vào đa số các node trong replica set
        serverApi: {
          version: '1', // Chỉ định phiên bản API của MongoDB
          strict: true, // Yêu cầu các trường phải được định nghĩa trong schema
          deprecationErrors: true, // Báo lỗi nếu sử dụng các tính năng đã deprecated
        },
      });
      logger.info('MongoDB connected successfully');
      return;
    } catch (err) {
      logger.error(`MongoDB connection error (attempt ${i + 1}):`, err.message);
      if (i < retries - 1) await new Promise(resolve => setTimeout(resolve, delay));
      else {
        logger.error('All retry attempts failed. Exiting process.');
        process.exit(1);
      }
    }
  }
};

// Xử lý sự kiện kết nối
mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));

// Xử lý khi ứng dụng dừng
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed due to app termination');
  process.exit(0);
});

module.exports = connectDB;