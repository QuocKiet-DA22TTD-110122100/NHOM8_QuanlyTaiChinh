# 💰 NHOM8_QuanlyTaiChinh - Ứng dụng Quản lý Tài chính Cá nhân

> **Phiên bản nâng cấp UI/UX 2.0** - Giao diện hiện đại, trực quan và thân thiện với người dùng

## 🎨 **CẬP NHẬT MỚI NHẤT - UI/UX ENHANCEMENT**

### ✨ **Những thay đổi chính đã thực hiện:**

#### 🏠 **Dashboard (Trang chủ)**
- ✅ Thiết kế lại hoàn toàn với gradient backgrounds và animations
- ✅ Thêm 4 cards thống kê: Thu nhập, Chi tiêu, Số dư, Giao dịch
- ✅ Tích hợp 3 biểu đồ tương tác: BarChart, PieChart, LineChart (Recharts)
- ✅ Loading skeleton UI cho trải nghiệm mượt mà
- ✅ Responsive design và dark mode support

#### 🧭 **Sidebar Navigation**
- ✅ Giao diện hiện đại với gradient background
- ✅ Active state rõ ràng và hover effects
- ✅ User profile section với toggle dark mode
- ✅ Hỗ trợ collapsed mode

#### 📋 **Header**
- ✅ Thông báo dropdown với đếm số chưa đọc
- ✅ User profile dropdown với navigation
- ✅ Hiển thị thời gian và ngày tháng hiện tại
- ✅ Backdrop blur effects
- ✅ **Đã bỏ**: Thanh tìm kiếm (theo yêu cầu)

#### 💰 **Trang Thu nhập (Income)**
- ✅ Search và filter theo danh mục
- ✅ Thống kê tổng thu nhập, số giao dịch, trung bình
- ✅ Form thêm thu nhập với toggle show/hide
- ✅ Bảng danh sách với category badges màu sắc
- ✅ Toast notifications cho các thao tác

#### 💸 **Trang Chi tiêu (Expense)**
- ✅ Tương tự trang Income với theme màu đỏ/pink
- ✅ 8 danh mục chi tiêu với màu sắc và emoji riêng biệt
- ✅ Search, filter, form thêm chi tiêu
- ✅ Toast notifications

#### 📊 **Trang Ngân sách (Budget)**
- ✅ Quản lý ngân sách theo tháng
- ✅ Thống kê tổng ngân sách, chi tiêu, số dư
- ✅ Cảnh báo khi vượt ngân sách
- ✅ Chỉnh sửa ngân sách từng danh mục
- ✅ Progress bars màu sắc thể hiện % đã dùng

#### 📈 **Trang Báo cáo (Reports)**
- ✅ Giao diện hiện đại với 4 cards thống kê tổng quan
- ✅ So sánh tăng trưởng với năm trước
- ✅ 3 biểu đồ chi tiết: Thu chi theo tháng, Phân bổ chi tiêu, Xu hướng số dư
- ✅ Bảng chi tiết danh mục với progress bars
- ✅ **Tính năng xuất báo cáo CSV** hoạt động đầy đủ

#### 👤 **Trang Hồ sơ (Profile)**
- ✅ Quản lý thông tin cá nhân với avatar upload
- ✅ Chỉnh sửa thông tin trực tiếp
- ✅ Thống kê hoạt động người dùng
- ✅ **Đã bỏ**: Trang Settings (theo yêu cầu)

### 🛠️ **Cải tiến kỹ thuật:**
- ✅ **API Service Layer**: Tạo unified API với fallback localStorage
- ✅ **Error Handling**: Sửa lỗi Docker build (Heroicons imports)
- ✅ **Code Organization**: Tách biệt components và services
- ✅ **Performance**: Tối ưu loading và animations

### 🎯 **Tính năng UI/UX nổi bật:**
- 🌙 **Dark Mode**: Hỗ trợ chế độ tối cho tất cả components
- 🎨 **Animations**: Hover effects, transitions, transform scales
- 📱 **Responsive**: Hoạt động tốt trên desktop, tablet, mobile
- 🎭 **Visual Hierarchy**: Typography scales, color coding, spacing
- 🔔 **Notifications**: Toast messages và dropdown notifications
- 📊 **Data Visualization**: Biểu đồ đẹp với Recharts
- 🎪 **Interactive Elements**: Buttons, dropdowns, forms với focus states

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
- [ ] Phát triển API RESTful chuẩn hóa
- [ ] Triển khai bảo mật backend


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
- [ ] Phát triển phiên bản mobile 
- [ ] Tích hợp biểu đồ nâng cao
- [ ] Tích hợp AI dự đoán chi tiêu
- [ ] Hỗ trợ chia sẻ dữ liệu
- [ ] Đồng bộ dữ liệu đa thiết bị
