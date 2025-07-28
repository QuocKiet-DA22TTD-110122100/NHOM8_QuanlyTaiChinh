# 💰 Ứng dụng Quản lý Tài chính Cá nhân

> Hệ thống quản lý tài chính cá nhân hiện đại với React Frontend và Node.js Backend

## 🚀 Tính năng chính

### 📊 Dashboard & Báo cáo
- Tổng quan thu chi theo thời gian thực
- Biểu đồ phân tích chi tiết (tuần/tháng/năm)
- Báo cáo xuất Excel/PDF

### 💳 Quản lý Giao dịch
- Thêm/sửa/xóa giao dịch nhanh chóng
- Phân loại thu nhập và chi tiêu
- Hỗ trợ nhiều phương thức thanh toán

### 🏦 Tích hợp Ngân hàng
- Liên kết tài khoản ngân hàng
- Đồng bộ số dư tự động
- Theo dõi nhiều tài khoản

### 📱 Giao diện hiện đại
- Responsive design
- Dark/Light mode
- PWA support

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js** + **Express.js**
- **MongoDB** với Mongoose
- **JWT** Authentication
- **Swagger** API Documentation
- **Redis** Caching
- **Docker** Containerization

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS**
- **React Router DOM**
- **Recharts** cho biểu đồ
- **Axios** HTTP client

## 📦 Cài đặt và Chạy

### 1. Clone repository
```bash
git clone https://github.com/QuocKiet-DA22TTD-110122100/NHOM8_QuanlyTaiChinh.git
cd NHOM8_QuanlyTaiChinh
```

### 2. Cài đặt dependencies
```bash
# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

### 3. Cấu hình môi trường
```bash
# Tạo file .env
cp .env.example .env
# Chỉnh sửa các biến môi trường
```

### 4. Chạy ứng dụng

#### Sử dụng Docker (Khuyến nghị)
```bash
docker-compose up -d
```

#### Chạy thủ công
```bash
# Backend (Terminal 1)
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

## 🌐 Truy cập ứng dụng

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/health

## 📚 API Documentation

Swagger UI cung cấp documentation đầy đủ tại: `http://localhost:5000/api-docs`

### Các endpoint chính:
- `POST /api/v1/auth/register` - Đăng ký
- `POST /api/v1/auth/login` - Đăng nhập
- `GET /api/v1/transactions` - Lấy danh sách giao dịch
- `POST /api/v1/transactions` - Tạo giao dịch mới
- `GET /api/v1/reports/summary` - Báo cáo tổng quan

## 🧪 Testing

```bash
# Chạy unit tests
npm test

# Test API endpoints
npm run test:api

# Load testing
npm run test:load
```

## 🚀 Deployment

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment
```bash
# Build frontend
cd frontend
npm run build

# Start backend
npm start
```

## 📁 Cấu trúc dự án

```
NHOM8_QuanlyTaiChinh/
├── backend/
│   ├── routes/          # API routes
│   ├── models/          # Database models
│   ├── middleware/      # Express middleware
│   ├── config/          # Configuration files
│   └── tests/           # Test files
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   └── utils/       # Utility functions
│   └── public/          # Static assets
├── docker-compose.yml   # Docker configuration
└── README.md
```

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request



## 👥 Nhóm phát triển

- **Huỳnh Quốc Kiệt** - *Team Leader & Backend Developer*
- **Đặng Minh Hiếu** - *Frontend Developer*
- **Mai Hồng Lợi** - *UI/UX Designer*

## 📞 Liên hệ

- Email: quockiet.da22ttd@example.com
- GitHub: [@QuocKiet-DA22TTD-110122100](https://github.com/QuocKiet-DA22TTD-110122100)

---

⭐ **Nếu dự án hữu ích, hãy cho chúng tôi một star!** ⭐
