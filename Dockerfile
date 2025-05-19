# Sử dụng Node.js image chính thức
FROM node:18-slim

# Tạo thư mục làm việc trong container
WORKDIR /app

# Sao chép package.json và cài đặt phụ thuộc
COPY package*.json ./
RUN npm install

# Sao chép toàn bộ mã nguồn
COPY . .

# Expose cổng chạy ứng dụng
EXPOSE 5000

# Chạy ứng dụng
CMD ["node", "app.js"]