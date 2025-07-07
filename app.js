// Các thư viện
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
// Bỏ dotenv vì Docker Compose truyền biến môi trường
console.log('[INFO] MONGO_URI:', process.env.MONGO_URI);
console.log('[INFO] PORT:', process.env.PORT);


// Khởi tạo app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

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

// Khởi động server
app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
