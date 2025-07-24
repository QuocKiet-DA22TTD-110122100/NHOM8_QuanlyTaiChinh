#!/bin/bash

echo "🔍 Checking ports..."

# Kiểm tra cổng đang sử dụng
echo "📊 Current port usage:"
echo "Port 3000 (Frontend):"
lsof -i :3000 || echo "✅ Port 3000 available"

echo "Port 5000 (Backend):"
lsof -i :5000 || echo "✅ Port 5000 available"

echo "Port 27017 (MongoDB):"
lsof -i :27017 || echo "✅ Port 27017 available"

echo "Port 6379 (Redis):"
lsof -i :6379 || echo "✅ Port 6379 available"

# Kiểm tra Docker containers
echo ""
echo "🐳 Docker containers:"
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"

# Kiểm tra kết nối
echo ""
echo "🌐 Testing connections:"
curl -f http://localhost:5000/health && echo "✅ Backend healthy" || echo "❌ Backend not responding"
curl -f http://localhost:3000 && echo "✅ Frontend healthy" || echo "❌ Frontend not responding"