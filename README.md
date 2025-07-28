# 💰 Ứng dụng Quản lý Tài chính Cá nhân

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen?logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-Supported-blue?logo=docker)
![License](https://img.shields.io/badge/License-MIT-yellow)

> Hệ thống quản lý tài chính cá nhân hiện đại với React Frontend & Node.js Backend

---

## 📑 Mục lục
- [Giới thiệu](#giới-thiệu)
- [Tính năng nổi bật](#tính-năng-nổi-bật)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt & Chạy thử](#cài-đặt--chạy-thử)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [API chính](#api-chính)
- [Testing](#testing)
- [Triển khai](#triển-khai)
- [Đóng góp](#đóng-góp)
- [Nhóm phát triển](#nhóm-phát-triển)
- [Liên hệ](#liên-hệ)

---

## 📝 Giới thiệu
Ứng dụng giúp bạn quản lý thu chi, ngân sách cá nhân, liên kết ngân hàng, xuất báo cáo, giao diện hiện đại, bảo mật và dễ sử dụng.

---

## ✨ Tính năng nổi bật
| Tính năng                | Mô tả ngắn                                             |
|-------------------------|-------------------------------------------------------|
| 📊 Dashboard            | Tổng quan thu chi, biểu đồ phân tích, báo cáo xuất file|
| 💳 Quản lý giao dịch    | Thêm/sửa/xóa, phân loại, đa phương thức thanh toán     |
| 🏦 Tích hợp ngân hàng   | Liên kết, đồng bộ số dư, nhiều tài khoản              |
| 🌗 Giao diện hiện đại   | Responsive, Dark/Light mode, PWA support              |
| 🔒 Bảo mật              | Đăng nhập, xác thực JWT, quản lý người dùng            |

---

## 🛠️ Công nghệ sử dụng
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT, Swagger, Redis, Docker
- **Frontend:** React 18, Vite, Tailwind CSS, React Router DOM, Recharts, Axios

---

## 🚀 Cài đặt & Chạy thử
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
cp .env.example .env # Tạo file .env
# Chỉnh sửa các biến môi trường cho phù hợp
```
### 4. Chạy ứng dụng
- **Bằng Docker (Khuyến nghị):**
```bash
docker-compose up -d
```
- **Chạy thủ công:**
```bash
# Backend (Terminal 1)
npm run dev
# Frontend (Terminal 2)
cd frontend
npm run dev
```

### 🌐 Truy cập
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api-docs
- Health Check: http://localhost:5000/health

---

## 🗂️ Cấu trúc dự án
```text
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
├── docker-compose.yml   # Docker config
└── README.md
```

---

## 📚 API chính
- `POST /api/v1/auth/register` – Đăng ký
- `POST /api/v1/auth/login` – Đăng nhập
- `GET /api/v1/transactions` – Lấy danh sách giao dịch
- `POST /api/v1/transactions` – Tạo giao dịch mới
- `GET /api/v1/reports/summary` – Báo cáo tổng quan

Xem chi tiết tại: [Swagger UI](http://localhost:5000/api-docs)

---

## 🧪 Testing
```bash
npm test         # Unit tests
npm run test:api # Test API endpoints
npm run test:load # Load testing
```

---

## 🚀 Triển khai
- **Docker Production:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```
- **Manual Deployment:**
```bash
cd frontend && npm run build
cd .. && npm start
```

---

## 🤝 Đóng góp
1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add some AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

---

## 👥 Nhóm phát triển
- 👨‍💻 **Huỳnh Quốc Kiệt** – Team Leader & Backend
- 👨‍💻 **Đặng Minh Hiếu** – Frontend
- 🎨 **Mai Hồng Lợi** – UI/UX Designer

---

## 📞 Liên hệ
- Email: quockiet.da22ttd@example.com
- GitHub: [@QuocKiet-DA22TTD-110122100](https://github.com/QuocKiet-DA22TTD-110122100)

---

⭐ **Nếu dự án hữu ích, hãy cho chúng tôi một star!** ⭐
