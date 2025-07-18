# NHOM8_QuanlyTaiChinh
Xây Dựng Web Quản Lý Tài Chính  NEXT.JS
# Ứng dụng Quản lý Tài chính Cá nhân

## Cấu trúc dự án

- `backend/` - Node.js API server
- `frontend/` - React frontend application

## Nhánh phát triển

- `main` - Nhánh chính
- `backend` - Phát triển backend
- `frontend` - Phát triển frontend

## Chạy ứng dụng

```bash
# Chạy toàn bộ ứng dụng
docker-compose up -d

# Backend: http://localhost:5001
# Frontend: http://localhost:3000
```

## Tính năng

### 🚀 Quản lý Tài chính Nâng cao
- 🔐 Hệ thống xác thực người dùng an toàn với JWT
- 📊 Báo cáo tùy chỉnh theo thời gian (tuần/tháng/năm)
- 🔔 Nhắc nhở thanh toán định kỳ
- 🏷️ Gắn thẻ và phân loại giao dịch linh hoạt
- 📤 Xuất dữ liệu ra Excel/PDF

### 💳 Hỗ trợ Đa phương tiện
- 📸 Tải lên hình ảnh hóa đơn
- 🧾 Quét QR code từ hóa đơn điện tử
- 🔗 Liên kết với tài khoản ngân hàng (Open Banking)

### 🌐 Đa nền tảng
- 📱 Ứng dụng di động (React Native)
- 🖥️ Extension trình duyệt
- 💬 Integration với chatbot (Telegram/Zalo)

## Hướng phát triển

### Backend
- [ ] Triển khai Redis để caching
- [ ] Thêm WebSocket cho thông báo realtime
- [ ] Tích hợp với các API ngân hàng
- [ ] Hỗ trợ webhook cho tích hợp bên thứ 3

### Frontend
- [ ] Thêm PWA hỗ trợ offline
- [ ] Internationalization (i18n)
- [ ] Dark mode nâng cao
- [ ] Tối ưu hiệu năng với lazy loading

## Cài đặt

1. Clone repository:
```bash
git clone https://github.com/QuocKiet-DA22TTD-110122100/NHOM8_QuanlyTaiChinh.git
cd quanlytaichinh
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Chạy ứng dụng ở môi trường development:
```bash
npm run dev
```

4. Build ứng dụng cho production:
```bash
npm run build
```

## Công nghệ sử dụng

- React
- Tailwind CSS
- React Router DOM
- Recharts
- Vite
- LocalStorage cho lưu trữ dữ liệu

## Phát triển trong tương lai

- [ ] Thêm xác thực người dùng
- [ ] Tích hợp với backend (MongoDB)
- [ ] Xuất báo cáo PDF
- [ ] Thêm tính năng nhắc nhở thanh toán
- [ ] Hỗ trợ nhiều loại tiền tệ
