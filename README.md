# Ứng dụng Quản lý Tài chính Cá nhân

Ứng dụng web giúp quản lý thu chi và ngân sách cá nhân, được xây dựng bằng React và Tailwind CSS.

## Tính năng

- 📊 Dashboard tổng quan với biểu đồ thu chi
- 💰 Quản lý thu nhập
- 💸 Quản lý chi tiêu
- 📅 Thiết lập ngân sách theo danh mục
- 📈 Báo cáo thống kê chi tiết
- 🌓 Hỗ trợ giao diện sáng/tối
- 📱 Responsive trên mọi thiết bị

## Cài đặt

1. Clone repository:
```bash
git clone [url-repository]
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

## Cấu trúc thư mục

```
src/
  ├── components/     # Components tái sử dụng
  ├── pages/         # Các trang chính
  ├── App.jsx        # Component gốc
  ├── main.jsx       # Entry point
  └── index.css      # Styles toàn cục
```

## Phát triển trong tương lai

- [ ] Thêm xác thực người dùng
- [ ] Tích hợp với backend (MongoDB)
- [ ] Xuất báo cáo PDF
- [ ] Thêm tính năng nhắc nhở thanh toán
- [ ] Hỗ trợ nhiều loại tiền tệ
